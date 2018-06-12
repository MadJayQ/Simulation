class Tile {
    constructor(tID, x, y) {
        this.pos = [x, y];
        this.tID = tID;
        this.attachedEnts = {};
        this.traversable = true;
    }

    draw(ctx, width, height) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.rect(this.pos[0] * width, this.pos[1] * height, width, height);
        ctx.fill();
        ctx.stroke();
    }
}

module.exports.Tile = Tile;