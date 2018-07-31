var NetMsg = require('./NetMsg.js');
var SimulationWorld = require('../Simulation/World.js');
const MathExt = require('../math.js')

class Command {
    constructor(requestName, responseCb, payload) {
        this.request = requestName;
        this.responseCb = responseCb;
        this.payload = payload;
    }

    issueRequest(ipc) {
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND);
        ipc.send(
            "asynchronous-message",
            netMsg.serialize((this.payload !== undefined) ? this.request + ";" + this.payload : this.request)
        );
    }

    execute(pipe) {
        this.responseCb(pipe);
    }
}


class GridCommand extends Command {
    constructor(world) {
        super("query-grid", () => {this.execute});
        this.world = world;
    }

    execute(pipe) {
        var serialziedWorld = this.world.serialize();
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        pipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: GridCommand.REQ,
                body: serialziedWorld
            }
        ));
    }

    static get REQ() {
        return "grid-request";
    }
}

class CarsCommand extends Command {
    constructor(world) {
        super("cars", () => {this.execute});
        this.world = world;
    }
    execute(pipe) {
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        pipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: CarsCommand.REQ,
                body: this.world.serializeCars()
            }
        ));
    }
    static get REQ() {
        return "cars";
    }
}

class SettingsCommand extends Command {
    constructor(world, payload) {
        super("settings", () => {this.execute}, payload);
        this.world = world;
    }
    execute(pipe) {
        if(this.payload !== undefined) {
            var settingsPayload = JSON.parse(this.payload);
            this.world.settings.worldSettings = settingsPayload.worldSettings;
            this.world.settings.timeSettings = settingsPayload.timeSettings;
        } else {
            var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
            pipe.sender.send("asynchronous-reply", netMsg.serialize(
                {
                    type: SettingsCommand.REQ,
                    body: this.world.settings
                } 
            ));
        }
    }
    static get REQ() {
        return "settings";
    }
}

class MaximumTimeSensingCommand extends Command {
    constructor(world, interpreter) {
        super("maximum-ts", () => {this.execute});
        this.world = world;
        this.interpreter = interpreter;
        this.activePipe = undefined;
        this.maxTS = -1.0;
    }
    finish(maximumTS) {
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        this.maxTS = parseFloat(maximumTS);
        this.world.setCarCapacity(this.maxTS);
        if(this.activePipe !== undefined) {
            this.activePipe.sender.send("asynchronous-reply", netMsg.serialize(
                {
                    type: MaximumTimeSensingCommand.REQ,
                    body: maximumTS
                }
            ));
        }
    }
    execute(pipe) {
        this.activePipe = pipe;
        this.interpreter.startModule(this.world);
        this.interpreter.runModule("max-ts");
        this.interpreter.notifyOnFinish(this.finish, this);

    }

    static get REQ() {
        return "maximum-ts";
    }
}
class SimulationBakeCommand extends Command {
    constructor(world, interpreter) {
        super("bake-simulation", () => {this.execute});
        this.world = world;
        this.interpreter = interpreter;
        this.activePipe = undefined;
    }

    finishSimulation(moveData) {
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        this.world.executeMove(moveData);
        this.activePipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: SimulationBakeCommand.REQ,
                body: moveData
            }
        ));
    }

    execute(pipe) {
        this.interpreter.startModule(this.world);
        this.interpreter.runModule("start");
        this.interpreter.notifyOnFinish(this.finishSimulation, this);
        this.activePipe = pipe;
    }

    static get REQ() {
        return "bake-simulation";
    }
}


class RandomizeWorldCommand extends Command {
    constructor(world) {
        super("randomize-world", () => {this.execute});
        this.world = world;
    }

    execute(pipe) {
        var w = this.world.width;
        var h = this.world.height;
        var numCars = MathExt.randInt(this.world.settings.worldSettings.minCars, this.world.settings.worldSettings.maxCars);
        var carSettings = {};
        var colorSettings = {};
        var tileSettings = {};
        
        for(var i = 0; i < numCars; i++) {
            var startPos = [MathExt.randInt(0, w - 1), MathExt.randInt(0, h - 1)];
            var endPos = [0, 0];
            var width = this.world.settings.worldSettings.tileWidth;
            var tileIdx = MathExt.coordinatesToIndex(startPos[1], startPos[0], width);
            carSettings[i] = {
                startPos: startPos,
                endPos: endPos
            };
        }
        this.world.tiles = [];
        this.world.tileData = undefined;
        this.world.settings.carSettings = carSettings;
        this.world.settings.tileSettings = tileSettings;
        this.world.width = this.world.settings.worldSettings.tileWidth;
        this.world.height = this.world.settings.worldSettings.tileHeight;
        this.world.constructTiles(this.world.width, this.world.height);
        this.world.applySettings();
        var serialziedWorld = this.world.serialize();

        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        pipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: RandomizeWorldCommand.REQ,
                body: serialziedWorld
            }
        ));

    }

    static get REQ() {
        return "randomize-world";
    }
}

//module.exports.Command = Command;
module.exports.GridCommand = GridCommand;
module.exports.SimulationBakeCommand = SimulationBakeCommand;
module.exports.RandomizeWorldCommand = RandomizeWorldCommand;
module.exports.MaximumTimeSensingCommand = MaximumTimeSensingCommand;
module.exports.SettingsCommand = SettingsCommand;
module.exports.CarsCommand = CarsCommand;