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
        }
    }

    applySettings() {
        this.crowdSourcers = [];
        this.cars = [];
        if(this.settings.tileSettings && this.settings.crowdSourcerSettings && this.settings.carSettings) {
            for(var tileIdx in this.settings.tileSettings ) {
                var tId = Number(tileIdx);
                var tile = this.tiles[tId];
                var setting = this.settings.tileSettings[tId];
                tile.traversable = setting.traversable;
                if(setting.crowdSourcer != undefined) {
                    var cID = Number(setting.crowdSourcer);
                    var budget = this.settings.crowdSourcerSettings[cID].budget;
                    var cs = new CrowdSourcer(cID, budget);
                    tile.attachedEnts["crowdSourcer"] = cs;
                    this.crowdSourcers.push(cs);
                }
                if(setting.carIdx != undefined) {
                    var cID = Number(setting.carIdx);
                    var startPos = this.settings.carSettings[cID].startPos;
                    var endPos = this.settings.carSettings[cID].endPos;
                    var c = new Car(cID, startPos, endPos);
                    tile.attachedEnts["car-" + cID] = c;
                    this.cars.push(c);
                }
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
                traversable: t.traversable
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