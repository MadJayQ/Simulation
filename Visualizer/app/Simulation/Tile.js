class Tile {
    constructor(tID, x, y) {
        this.pos = [x, y];
        this.tID = tID;
        this.attachedEnts = {};
        this.traversable = true;
        this.justUpdated = false;
        this.numVisited = 0;
        this.color = 'white';
    }

    drawHeatmap(ctx, width, height, frac) {
        var interpolateColor = function(color1, color2, factor) {
            if (arguments.length < 3) { factor = 0.5; }
            var result = color1.slice();
            for (var i=0;i<3;i++) {
              result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
              if(result[i] < 0) {
                  result[i] = 0;
              }
              if(result[i] > 255) {
                  result[i] = 255;
              }
            }
            return result;
        };
        var startColor = [255, 255, 255];
        var targetColor = [255, 0, 0];
        var actualColor = interpolateColor(startColor, targetColor, frac);
        var tempColor = this.color;
        this.color = 'rgb(' + actualColor[0] + ',' + actualColor[1] + ',' + actualColor[2] + ')';
        this.draw(ctx, width, height);
        this.color = tempColor;
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