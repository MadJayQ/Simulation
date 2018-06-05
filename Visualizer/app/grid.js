var math = require('./math.js');
var Car = require('./Simulation/Car.js')

module.exports = class Grid {
    constructor(size, numCars, gridData) {
        this.size = size;
        this.numCars = numCars;
        var carIdx = 1;
        this.grid = [];
        if(gridData == undefined) {      
            for(var i = 0; i < this.size; i++) {
                this.grid[i] = [];
                for(var j = 0; j < this.size; j++) {
                    this.grid[i][j] = 0;
                    if(j == 0 && carIdx <= this.numCars) this.grid[i][j] = (carIdx);
                    if(j == this.size - 1 && carIdx <= this.numCars) this.grid[i][j] = (-carIdx);
                }
                carIdx++;
            }
        } else {
            for(var i = 0; i < gridData.length; i += size) {
                this.grid.push(gridData.slice(i, i + size));
            }
        }
    }

    createCar(x1, y1, x2, y2, cID) {
        var c = new Car.Car(
            cID, 
            [x1, y1],
            [x2, y2]
        );
        
        return c;
    }
};