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
                    coords[0],
                    coords[1]
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
                }
            } else {
                this.tiles[i] = new Tile.Tile(
                    i,
                    coords[0],
                    coords[1]
                );
                this.tiles[i].reward = MathExt.randInt(this.settings.worldSettings.minReward, this.settings.worldSettings.maxReward);
                this.tiles[i].cost = MathExt.randNum(this.settings.worldSettings.minCost, this.settings.worldSettings.maxCost);
            }
        }
    }
    
    executeMove(moveData) {
        moveData = JSON.parse(moveData);
        console.log("MOVE DATA!");
        for (var move in moveData) {
            var newTile = this.tiles[parseInt(moveData[move]["new"])];
            var previousTile = this.tiles[parseInt(moveData[move]["previous"])];
            var car = previousTile.attachedEnts[move];
            if(car !== undefined) {
                var newCapacity = parseInt(moveData[move]["newCapacity"]);
                delete previousTile.attachedEnts[move];
                var newCoords = MathExt.indexToCoordinates(parseInt(moveData[move]["new"]), this.width);
                var cID = car["cID"];
                newTile.attachedEnts[move] = new Car(car["cID"], newCoords, car["endPos"]);
                this.cars[Number(cID)] = newTile.attachedEnts[move];
                newTile.attachedEnts[move].capacity = newCapacity;
                newTile.justUpdated = true;
                previousTile.justUpdated = true;
            }
        }
    }

    setCarCapacity(maxTS) {
        for(var i = 0; i < this.cars.length; i++) {
            var car = this.cars[i];
            if(car !== undefined) {
                car.capacity = MathExt.randInt(this.settings.worldSettings.minCapacity, this.settings.worldSettings.maxCapacity) * maxTS;
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
                this.tiles[spawnTileID].attachedEnts["car-" + carIdx] = carObject;
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
                carData[i] = {
                    startPos: car.startPos,
                    endPos: car.endPos,
                    capacity: car.capacity
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
            tiles: tileData
        }

        return JSON.stringify(data);
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