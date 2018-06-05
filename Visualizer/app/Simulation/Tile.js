class Tile {
    constructor(tID, x, y) {
        this.pos = [x, y];
        this.tID = tID;
        this.attachedEnts = {};
    }
}

module.exports.Tile = Tile;