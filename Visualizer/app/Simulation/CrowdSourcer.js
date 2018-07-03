class CrowdSourcer  {
    constructor(cID, budget) {
        this.budget = budget;
        this.cID = cID;
        this.color = "white";
    }

    SetColor(color) {
        this.color = color;
    }
    
    draw(ctx, x, y, w, h) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();
    }
}

module.exports = CrowdSourcer;