var g_eID = 0;
class SimulatedEntity {
    constructor(eID) {
        this.eID = eID;
    }
}
var createEntity = () => {
    return g_eID++;
}

module.exports.SimulatedEntity = SimulatedEntity;
module.exports.createEnt = createEntity;