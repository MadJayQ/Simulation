var SimulatedEntity = require('./SimulatedEntity.js')

class Car extends SimulatedEntity.SimulatedEntity {
    constructor(cID, startPos, endPos) {
        super(SimulatedEntity.createEnt());
        this.cID = cID;
        this.startPos = startPos;
        this.endPos = endPos;
    }
}

module.exports.Car = Car;