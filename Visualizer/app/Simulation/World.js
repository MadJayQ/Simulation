const Tile = require('./Tile.js')
const MathExt = require('../math.js')

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

        if(!(builder instanceof World.Builder)) {
            console.error("[WORLD]: Cannot create World object with new operator, must use World.Builder!");
            return undefined;
        }

        this.settings = (builder.settings != undefined) ? builder.settings : this.defaultSettings;
        if(this.settings != undefined) {
            this.constructTiles(
                this.settings.worldSettings.tileWidth,
                this.settings.worldSettings.tileHeight
            )
            //If we have given our simulation world any default tile settings, go ahead and apply them here
            if(this.settings.tileSettings) { //Tile settings include: crowdSourcers, traversability, and car spawn locations
                this.applyTileSettings();
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
    
    applyTileSettings() {

    }

    static get Builder() {
        class Builder {
            constructor() { //Pass the settings into the constructor of the builder
                this.width = 0;
                this.height = 0;
            }

            fromSettings(settings) {
                this.settings = settings;
                return this;
            }

            fromWorldSettings(worldSettings) {
                this.settings.worldSettings = worldSettings;
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