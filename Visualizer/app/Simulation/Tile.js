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

var stringifyColor = function(color) {
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
}


class Tile {
    constructor(tID, x, y) {
        this.pos = [x, y];
        this.tID = tID;
        this.attachedEnts = {};
        this.traversable = true;
        this.justUpdated = false;
        this.numVisited = 0;
        this.spawnChance = Math.random();
        this.dstChance = Math.random();
        this.color = 'white';
    }

    drawLabel(ctx, width, height, text, fontSize, fontName) {
        var x = this.pos[1] * width;
        var y = this.pos[0] * height;

        ctx.font = fontSize.toString() + "px " + fontName;
        var textSize = ctx.measureText(text);
        while(textSize.width > (width * 0.2)) {
            fontSize -= 1;
            ctx.font = fontSize.toString() + "px " + fontName;
            textSize = ctx.measureText(text);
        }
        ctx.fillText(text, x + (textSize.width / 2), y + (textSize.width * 1.3));
    }
    
    drawSpawnChances(ctx, width, height, spawnFraction, dstFrac) {
        var x = this.pos[1] * width;
        var y = this.pos[0] * height;

        var startColor = [255, 255, 255];
        var targetSpawn = [255, 0, 0];
        var targetDst = [0, 255, 0];
        var calculatedSpawnColor = interpolateColor(startColor, targetSpawn, spawnFraction);
        var calculatedDstColor = interpolateColor(startColor, targetDst, dstFrac);
        var actualSpawnColor = stringifyColor(calculatedSpawnColor);
        var actualDstColor = stringifyColor(calculatedDstColor);
        
        ctx.fillStyle = actualSpawnColor;
        ctx.strokeStyle = actualSpawnColor
        ctx.beginPath();
        ctx.rect(x, y, width / 2, height);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = actualDstColor;
        ctx.strokeStyle = actualDstColor;
        ctx.beginPath();
        ctx.rect(x + (width / 2), y, width / 2, height);
        ctx.fill();
        ctx.stroke();
        //Clearly Define tile outline
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();    
        ctx.fillStyle = 'black';
        this.drawLabel(ctx, width, height, this.tID.toString(), 50, "Times New Roman");
    }
    
    drawHeatmap(ctx, width, height, frac) {
        var startColor = [255, 255, 255];
        var targetColor = [255, 0, 0];
        var actualColor = interpolateColor(startColor, targetColor, frac);
        var tempColor = this.color;
        this.color = stringifyColor(actualColor);
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
        var numEnts = Object.keys(this.attachedEnts).length.toString();
        
        this.drawLabel(ctx, width, height, numEnts, 50, "Times New Roman");
    }
}

module.exports.Tile = Tile;