class _MoveData_
{
    constructor() {
        this.moves = {};
        this.lastSimulation = '';
        this.itr = 0;
    }

    newSimulation(settings) {
        this.lastSimulation = (new Date).toISOString();
        this.moves[this.lastSimulation] = {
            settings: settings
        };
        this.itr = 0;
    }

    addMove(move) {
        this.moves[this.lastSimulation][this.itr] = move;
        this.itr = this.itr + 1;
    }

    export() {

        var exportData = {};
        var carMoveData = {};
        for(var key in this.moves) {
            var move = this.moves[key];
            var numCars = move.settings.worldSettings.maxCars;
            carMoveData[key] = {};
            for(var itr in move) {
                var simulationItr = move[itr];
                for(var car in simulationItr) {
                    if(!car.includes("car-")) continue;
                    if(carMoveData[key][car] == undefined) {
                        carMoveData[key][car] = 0;
                    } else {
                        carMoveData[key][car] = carMoveData[key][car] + 1;
                    }
                }
            }
        }
        var numCars = 50.0;
        for(var key in carMoveData) {
            var movedata = carMoveData[key];
            if(Object.keys(movedata).length > 0) {
                var totalItrs = 0;
                for(var car in movedata) {
                    totalItrs += movedata[car]
                }
                exportData[key] = {
                    label: this.moves[key].settings.worldSettings.maxCost,
                    avgItrs: totalItrs / numCars 
                }
            }
        }
        require('fs').writeFile('./export.json', JSON.stringify(exportData));
    }
}

module.exports = (function(){
    var instance;
    return {
        getInstance: function(){
            if (null == instance) {
                instance = new _MoveData_();            
                instance.constructor = null; 
            }
            return instance; 
        }
   };
})();