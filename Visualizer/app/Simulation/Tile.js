class Tile {
    constructor(tID, x, y) {
        this.pos = [x, y];
        this.tID = tID;
        this.attachedEnts = {};
        this.traversable = true;
    }
}

module.exports.Tile = Tile;