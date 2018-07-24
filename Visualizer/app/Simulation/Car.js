const MathExt = require('../math.js');
class Car {
    constructor(cID, startPos, endPos) {
        this.cID = cID;
        this.startPos = startPos;
        this.endPos = endPos;
        this.color = "white";
        this.neighbors = [];
        this.capacity = MathExt.randInt(500, 1500);
    }

    SetColor(color) {
        this.color = color;
    }

    draw(ctx, x, y, w, h) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + (w/2), y + (h/2), h / 2, 0, 360, false);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        var newX = this.endPos[0] * w;
        var newY = this.endPos[1] * h;
        ctx.arc(newX + (w/2), newY + (h/2), (h / 2), 0, 360, false);
        ctx.fill();
        ctx.stroke();
    }
}

module.exports = Car;