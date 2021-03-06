const Tile = require('./Tile.js')
const MathExt = require('../math.js')

const CrowdSourcer = require('./CrowdSourcer.js');
const Car = require('./Car.js');

/*
    The World Class
    This class depicts a simulation world, it is constructed through the Builder design pattern
    To see more information on the Builder design pattern please see:
    https://sourcemaking.com/design_patterns/builder

    I used this design pattern to easily be able to parameterize the construction of simulations
*/

class World {
    constructor(builder) {
        if(arguments.length != 1) {
            console.error("[WORLD]: Failed to construct the world!");
            return undefined;
        }
        if(!builder) return undefined;

        /*
        TODO(Jake): Try to fix this later, check the type of builder against World.Builder, might not be possible in the context of JavaScript.
        if(!(builder instanceof World.Builder)) {
            console.error("[WORLD]: Cannot create World object with new operator, must use World.Builder!");
            return undefined;
        }
        */ 
        this.settings = (builder.settings != undefined) ? builder.settings : this.defaultSettings;
        this.roadMapData = builder.roadMapData;
        if(this.settings != undefined) {
            if(builder.tileData !== undefined) {
                this.tileData = builder.tileData;
            }
            this.constructTiles(
                this.settings.worldSettings.tileWidth,
                this.settings.worldSettings.tileHeight
            )
            this.applySettings();
        } else {
            console.error("[WORLD]: Failed to create world: No settings available!");
            delete this;
        }
    }

    parseRoadMap(edges, junctions) {
        var data = junctions;
        for(var edgeKey in edges) {
            var edge = edgeKey.split("_to_");
            if(edge.length < 1) {
                console.error("INVALID EDGE DATA");
                continue;
            }
            var from = edge[0];
            var to = edge[1];
            if(data[from]['edges'] == undefined) {
                data[from]['edges'] = {};
            }
            data[from]['edges'][to] = 1;
        }
        this.roadMapData = data;
    }

    defaultSettings() {
        return undefined;
    }

    constructTiles(width, height) {
        this.tiles = [];
        this.width = width;
        this.height = height;
        var numTiles = width * height;
        for(var i = 0; i < numTiles; i++) {
            var coords = MathExt.indexToCoordinates(i, width);
            if(this.tileData !== undefined && this.tileData[i] !== undefined) {
                var tileData = this.tileData[i];
                this.tiles[i] = new Tile.Tile(
                    i,
                    coords[1],
                    coords[0]
                );
                if(i == 71) {
                    var tt = Object.keys(tileData.attachedEnts);
                    console.log("STOP!");
                }
                this.tiles[i].reward = tileData.reward;
                this.tiles[i].cost = tileData.cost;
                var entKeys = Object.keys(tileData.attachedEnts);
                for(var j = 0; j < entKeys.length; j++) {
                    var entKey = entKeys[j];
                    var cID = tileData.attachedEnts[entKey]["cID"];
                    var startPos = tileData.attachedEnts[entKey]["startPos"];
                    var endPos = tileData.attachedEnts[entKey]["endPos"];                    
                    this.tiles[i].attachedEnts[entKey] = new Car(cID, startPos, endPos);
                    MathExt.seededRandInt(this.settings.worldSettings.minCapacity, this.settings.worldSettings.maxCapacity) * this.maxTS;
                }
            } else {
                this.tiles[i] = new Tile.Tile(
                    i,
                    coords[1],
                    coords[0]
                );
                this.tiles[i].reward = MathExt.seededRandInt(this.settings.worldSettings.minReward, this.settings.worldSettings.maxReward);
                this.tiles[i].cost = MathExt.seededRandFloat(this.settings.worldSettings.minCost, this.settings.worldSettings.maxCost);
            }
        }
    }

    distributeBudget(budget, min, clusterPositions) {

        createCluster = (x, y, width, size, weights) => {
            var step = 1.0 / size;
            var counter = 1;
            weights[MathExt.coordinatesToIndex(y, x)] += 1.0;
            for(var weight = 1.0 - step; weight > 0; weight -= step) {
                weights[MathExt.coordinatesToIndex(y, x - counter, width)] += weight;
                weights[MathExt.coordinatesToIndex(y - counter, x, width)] += weight;
                weights[MathExt.coordinatesToIndex(y - counter, x - counter, width)] += weight;
                weights[MathExt.coordinatesToIndex(y, x + counter, width)] += weight;
                weights[MathExt.coordinatesToIndex(y + counter, x, width)] += weight;
                weights[MathExt.coordinatesToIndex(y + counter, x + counter, width)] += weight;
                weights[MathExt.coordinatesToIndex(y + counter, x - counter, width)] += weight;
                weights[MathExt.coordinatesToIndex(y - counter, x + counter, width)] += weight;
            }
        }
        var weights = new Array(this.tiles.length);
        for(var i = 0; i < clusterPositions.length; i++) {
            var clusterPosition = clusterPositions[i];
            createCluster(clusterPosition[0], clusterPosition[1], this.width, 5, weights);
        }

        this.internalDistributeBudget(budget, min, weights);
    }

    internalDistributeBudget(budget, min, weights) {
        var subBudgets = new Array(this.tiles.length);
        var rands = new Array(this.tiles.length);
        var k = 0.0
        var err = 0.0
        var sum = 0.0
        budget -= this.tiles.length * min;
        if(weights !== undefined) {
            rands = weights;
            for(var i = 0; i < rands.length; i++) {
                sum += rands[i];
            }
        } else {
            for(var i = 0; i < this.tiles.length; i++) {
                rands[i] = MathExt.seededRandFloat(0, 1);
                sum += rands[i];
            }
        }
        k = budget / sum;
        for(var i = 1; i < this.tiles.length; i++) {
            var y = k * rands[i] + err;
            var z = Math.floor(y + 0.5);
            subBudgets[i] = min + z;
            budget -= z;
            err = y - z;
        }
        subBudgets[0] = min + budget;
        for(var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].reward = subBudgets[i];
        }
    }

    isFinished() {
        var finished = true;
        for(var i = 0; i < this.cars.length; i++) {
            var car = this.cars[i];
            if(car == undefined) continue;
            if(car.finished == true) continue;
            if(car.currentPos[0] != car.endPos[0] || car.currentPos[1] != car.endPos[1]) {
                finished = false;
                break;
            } else {
                car.finished = true;
            }
        }

        return finished;
    }
    
    executeMove(moveData) {
        try {
            moveData = JSON.parse(moveData);
        } catch (ex) {
            return;
        }
        for (var move in moveData) {
            var newTile = this.tiles[parseInt(moveData[move]["new"])];
            var previousTile = this.tiles[parseInt(moveData[move]["previous"])];
            var consumed = moveData[move]["consumed"];
            newTile.numVisited = newTile.numVisited + 1; //Increment our tile stat
            /*
            For now, wer're going to fix the Reward across each cell.
            if(consumed == false) {
                var amount = parseInt(moveData[move]["consumedAmount"]);
                if(newTile.reward < amount) amount = newTile.reward;
                newTile.reward -= amount;
            }
            */
            var car = previousTile.attachedEnts[move];
            if(car !== undefined) {
                var newCapacity = parseInt(moveData[move]["newCapacity"]);
                var finishedCached = previousTile.attachedEnts[move].finished;
                delete previousTile.attachedEnts[move];
                var newCoords = MathExt.indexToCoordinates(parseInt(moveData[move]["new"]), this.width);
                var cID = car["cID"];
                newTile.attachedEnts[move] = new Car(car["cID"], car["startPos"], car["endPos"]);
                this.cars[Number(cID)] = newTile.attachedEnts[move];
                newTile.attachedEnts[move].capacity = newCapacity;
                newTile.attachedEnts[move].currentPos = newTile.pos;
                newTile.attachedEnts[move].finished = finishedCached;
                newTile.justUpdated = true;
                previousTile.justUpdated = true;
            }
        }
    }

    resetTileStatistics() {
        for(var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].numVisited = 0;
        }
    }

    setCarCapacity(maxTS) {
        if(maxTS !== undefined) this.maxTS = maxTS;
        for(var i = 0; i < this.cars.length; i++) {
            var car = this.cars[i];
            if(car !== undefined) {
                car.capacity = MathExt.seededRandInt(this.settings.worldSettings.minCapacity, this.settings.worldSettings.maxCapacity) * this.maxTS;
            }
        }
    }

    applySettings() {
        this.crowdSourcers = [];
        this.cars = [];
        if(this.settings.tileSettings && this.settings.crowdSourcerSettings && this.settings.carSettings) {
            for(var carIdx in this.settings.carSettings) {
                var carSetting = this.settings.carSettings[carIdx];
                var startPos = carSetting.startPos;
                var endPos = carSetting.endPos;
                var carObject = new Car(carIdx, startPos, endPos);
                this.cars[carIdx] = carObject;
                var spawnTileID = MathExt.coordinatesToIndex(startPos[1], startPos[0], this.width);
                var tile = this.tiles[spawnTileID];
                if(tile == undefined) {
                    console.log("FAIL!");
                    continue;
                }
                tile.attachedEnts["car-" + carIdx] = carObject;
                if(carSetting.capacity != undefined) {
                    tile.attachedEnts["car-" + carIdx].capacity = carSetting.capacity;
                }
            }
        }
        var colorSettings = this.settings.colorSettings;
        if(colorSettings) {
            this.applyColorSettings(colorSettings);
        }
    }

    applyColorSettings(colorSettings) {
        return;
        var numCs = this.crowdSourcers.length;
        var numCars = this.cars.length;

        for(var i = 0; 
            i < Math.max(numCs, numCars);
            i++
        ) {
            var cs = this.crowdSourcers[i];
            var car = this.cars[i];
            var csColors = this.settings.colorSettings.crowdSourcers;
            var carColors = this.settings.colorSettings.cars;

            if(cs && csColors[cs.cID]) {
                cs.SetColor(csColors[cs.cID].color);
            }

            if(car && carColors[car.cID]) {
                car.SetColor(carColors[car.cID].color);
            }
            
        } 
    }

    serializeCars() {
        var carData = {};
        for(var i = 0; i < this.cars.length; i++) {
            var car = this.cars[i];
            if(car !== undefined) {
                if(car.finished) {
                    continue;
                }
                carData[i] = {
                    startPos: car.currentPos,
                    endPos: car.endPos,
                    capacity: car.capacity,
                    finished: car.finished
                }
            }
        }
        return JSON.stringify(carData);
    }
    serialize() {
    var tileData = {};
        for(var i = 0; i < this.tiles.length; i++) {
            var t = this.tiles[i];
            tileData[i] = {
                pos: t.pos,
                tID: t.tID,
                attachedEnts: t.attachedEnts,
                traversable: t.traversable,
                reward: t.reward,
                cost: t.cost
            } 
        }
        var data = {
            settings: this.settings,
            tiles: tileData,
            roadMapData: this.roadMapData
        };

        return JSON.stringify(data);
    }

    drawMapEditor(ctx) {
        var w = ctx.canvas.width / this.width;
        var h = ctx.canvas.height / this.height;
        var size = this.tiles.length || Object.keys(this.tiles).length;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        ctx.stroke();
        for(var i = 0; i < size; i++) {
            var tile = this.tiles[i] || this.tiles[toString(i)];
            tile.drawSpawnChances(ctx, w, h, tile.spawnChance, tile.dstChance);
        }
    }

    drawHeatmap(ctx) {
        var w = ctx.canvas.width / this.width;
        var h = ctx.canvas.height / this.height;
        var totalVisited = 0;
        for(var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            totalVisited += tile.numVisited;
        }
        var avgVisited = totalVisited / this.tiles.length;
        for(var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            tile.drawHeatmap(ctx, w, h, tile.numVisited / avgVisited);
        }
    }

    drawNodes(ctx) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'red';
        for(var nodeKey in this.roadMapData) {
            var node = this.roadMapData[nodeKey];
            var x = 15 + (node.normal_center_coords[0] * (ctx.canvas.width * 0.8)); 
            var y =  15 + (node.normal_center_coords[1] * (ctx.canvas.height * 0.9)); 
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            for(var edgeKey in node['edges']) {
                var dstNode = this.roadMapData[edgeKey];
                var dstX = 15 + (dstNode.normal_center_coords[0] * (ctx.canvas.width * 0.8)); 
                var dstY = 15 + (dstNode.normal_center_coords[1] * (ctx.canvas.height * 0.9));
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(dstX, dstY);
                ctx.stroke();
            }
        }
    }

    draw(ctx) {
        var w = ctx.canvas.width / this.width;
        var h = ctx.canvas.height / this.height;
        var size = this.tiles.length || Object.keys(this.tiles).length;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();
        ctx.stroke();
        for(var i = 0; i < size; i++) {
            var tile = this.tiles[i] || this.tiles[toString(i)];
            tile.draw(ctx, w, h);
        }
    }

    static get Builder() {
        class Builder {
            constructor() { //Pass the settings into the constructor of the builder
                this.width = 0;
                this.height = 0;
            }

            applySettings(settings) {
                this.settings = settings;
                return this;
            }

            applyWorldSettings(worldSettings) {
                this.settings.worldSettings = worldSettings;
                return this;
            }

            applyTimeSettings(timeSettings) {
                this.settings.timeSettings = timeSettings;
                return this; 
            }

            applyTileSettings(tileSettings) {
                this.settings.tileSettings = tileSettings;
                return this;
            }

            applyCarSettings(carSettings) {
                this.settings.carSettings = carSettings;
                return this;
            }

            applyCrowdSourcerSettings(crowdSourcerSettings) {
                this.settings.crowdSourcerSettings = crowdSourcerSettings;
                return this;
            }

            applyColorSettings(colorSettings) {
                this.settings.colorSettings = colorSettings;
                return this;
            }

            deserializeWorld(serializedWorld) {
                this.settings = serializedWorld.settings;
                this.tileData = serializedWorld.tiles;
                this.roadMapData = serializedWorld.roadMapData;
                return this;
            }

            build() {
                return new World(this);
            }
        }
        return Builder;
    }
}
module.exports = World;