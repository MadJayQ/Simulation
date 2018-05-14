var math = require('./math.js');
module.exports = class Grid {
    constructor(size, numCars) {
        this.size = size;
        this.numCars = numCars;
        this.grid = [
            [1, 0, 0, 0, -1],
            [-2, 0, 0, 0, -2],
            [-3, 0, 0, 0, -3],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
    }
    /*
    constructor(size, numCars) {
        this.size = size;
        this.numCars = numCars;

        this.grid = [];
        for(var row = 0; row < size; row++) {
            this.grid[row] = [];
            for(var col = 0; col < size; col++) {
                this.grid[row][col] = 0;
            }
        }
        for(var car = 1; car <= this.numCars; car++) {
            var row = [
                math.randInt(0, this.size - 1), 
                math.randInt(0, this.size - 1)
            ], col = [
                math.randInt(0, this.size - 1),
                math.randInt(0, this.size - 1)
            ];
            
            do {
                if(this.grid[row[0]][col[0]] != 0) {
                    row[0] = math.randInt(0, this.size - 1);
                    col[0] = math.randInt(0, this.size - 1);
                }
                if(this.grid[row[1]][col[1]] != 0) {
                    row[1] = math.randInt(0, this.size - 1);
                    col[1] = math.randInt(0, this.size - 1); 
                }

            } while(this.grid[row[0]][col[0]] != 0 || this.grid[row[1]][col[1]] != 0);

            console.log("Car: " + car + " | " + row + ">" + col);
            this.grid[row[0]][col[0]] = car;
            this.grid[row[1]][col[1]] = -car;
        }
        console.log(this.grid);
    }
    */
};