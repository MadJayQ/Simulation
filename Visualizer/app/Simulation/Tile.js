class Tile {
    constructor(tID, x, y) {
        this.pos = [x, y];
        this.tID = tID;
        this.attachedEnts = {};
        this.traversable = true;
        this.justUpdated = false;
        this.color = 'white';
    }
        
    draw(ctx, width, height) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        var x = this.pos[1] * width;
        var y = this.pos[0] * height;
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = (this.justUpdated) ? 'red' : 'black';
        this.justUpdated = false;
        var fontSize = 150;
        var numEnts = Object.keys(this.attachedEnts).length.toString();
        ctx.font = fontSize.toString() + "px Times New Roman";
        var textSize = ctx.measureText(numEnts);
        while(textSize.width > (width * 0.2)) {
            fontSize -= 1;
            ctx.font = fontSize.toString() + "px Times New Roman";
            textSize = ctx.measureText(numEnts);
        }
        ctx.fillText(numEnts, x + (textSize.width / 2), y + (textSize.width * 1.3));

    }
}

module.exports.Tile = Tile;