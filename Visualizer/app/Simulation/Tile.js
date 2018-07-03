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
        var x = this.pos[1] * width;
        var y = this.pos[0] * height;
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
        for(var entId in this.attachedEnts) {
            var ent = this.attachedEnts[entId];
            ent.draw(ctx, x, y, width, height);
        }
        if(!this.traversable) {
            var x0 = this.pos[1] * width;
            var x1 = x0 + width;
            var y0 = this.pos[0] * height;
            var y1 = y0 + height;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.strokeStyle = "red";
            ctx.lineTo(x1, y1);
            ctx.stroke();
        }
    }
}

module.exports.Tile = Tile;