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
            this.constructTiles(
                this.settings.worldSettings.tileWidth,
                this.settings.worldSettings.tileHeight
            )
            this.applySettings();
            if(builder.tiles) {
                this.tiles = builder.tiles;
            }
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
            this.tiles[i] = new Tile.Tile(
                i,
                coords[0],
                coords[1]
            );
            this.tiles[i].reward = MathExt.randInt(150, 250);
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
                var tileSetting = this.settings.tileSettings[spawnTileID];
                if(tileSetting == undefined) {
                    this.settings.tileSettings[spawnTileID] = {
                        traversable: true,
                        crowdSourcer: undefined,
                        carIdx: carIdx
                    }
                } else {
                    tileSetting.carIdx = carIdx;
                }
            }
            for(var csIdx in this.settings.crowdSourcerSettings) {
                var csSetting = this.settings.crowdSourcerSettings[csIdx];
                var budget = csSetting.budget;
                var pos = csSetting.pos;
                var cs = new CrowdSourcer(csIdx, budget);
                this.crowdSourcers[csIdx] = cs;
                var tileID = MathExt.coordinatesToIndex(pos[1], pos[0], this.width);
                var tileSetting = this.settings.tileSettings[tileID];
                if(tileSetting == undefined) {
                    this.settings.tileSettings[tileID] = {
                        traversable: true,
                        crowdSourcer: csIdx,
                        carIdx: undefined
                    }
                } else {
                    tileSetting.crowdSourcer = csIdx;
                }
            }
            for(var tileIdx in this.settings.tileSettings ) {
                var tId = Number(tileIdx);
                var tile = this.tiles[tId];
                var setting = this.settings.tileSettings[tId];
                tile.traversable = setting.traversable;
                if(setting.crowdSourcer != undefined) {
                    var cID = Number(setting.crowdSourcer);
                    var budget = this.settings.crowdSourcerSettings[cID].budget;
                    tile.attachedEnts["crowdSourcer"] = cs;
                }
                if(setting.carIdx != undefined) {
                    var cID = Number(setting.carIdx);
                    var c = this.cars[cID];
                    tile.attachedEnts["car-" + cID] = c;
                }
            }
        }
        var colorSettings = this.settings.colorSettings;
        if(colorSettings) {
            this.applyColorSettings(colorSettings);
        }
    }

    applyColorSettings(colorSettings) {
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

    serialize() {
        var tileData = {};
        for(var i = 0; i < this.tiles.length; i++) {
            var t = this.tiles[i];
            tileData[i] = {
                pos: t.pos,
                tID: t.tID,
                attachedEnts: t.attachedEnts,
                traversable: t.traversable,
                reward: t.reward
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
        for(var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            tile.draw(ctx, w, h);
        }
    }

    probeNeighbors() {
        var findNeighbors = (array, x, y) => {
            var neighbors = [];
            var rowLimit = array.length - 1;
            var columnLimit = array[0].length - 1;

            for(var x = Math.max(0, i - 1); x <= Math.min(i + 1, rowLimit); x++) {
                for(var y= Math.max(0, j-1); y <= Math.min(j+1, columnLimit); y++) {
                    if(x !== i || y !== j) {
                        if(array[i][j].attachedEnts != {}) {
                            neighbors.push(array[i][j].attachedEnts);
                        }
                    }
                }
            }

            return neighbors;
        }

        this.cars.forEach(element => {
            
        });
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