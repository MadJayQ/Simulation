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
        require('fs').writeFile('./export.json', JSON.stringify(this.moves));
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