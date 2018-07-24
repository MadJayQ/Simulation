var NetMsg = require('./NetMsg.js');
var SimulationWorld = require('../Simulation/World.js');
const MathExt = require('../math.js')

class Command {
    constructor(requestName, responseCb) {
        this.request = requestName;
        this.responseCb = responseCb;
    }

    issueRequest(ipc) {
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND);
        ipc.send(
            "asynchronous-message",
            netMsg.serialize(this.request)
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
        var newWorld = this.world.serialize();
        this.activePipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: SimulationBakeCommand.REQ,
                body: newWorld
            }
        ));
    }

    execute(pipe) {
        this.interpreter.startModule(this.world);
        this.interpreter.runModule();
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
        var randRange = (min, max) => { return Math.floor(Math.random() * (max - min)) + min; }
        var numCars = randRange(1, 5);
        var carSettings = this.world.settings.carSettings || {};
        var colorSettings = this.world.settings.colorSettings || {};
        var tileSettings = this.world.settings.tileSettings || {};
        
        for(var i = 0; i < numCars; i++) {
            var startPos = [randRange(0, w), randRange(0, h)];
            var endPos = [0, 0];
            var width = this.world.settings.worldSettings.tileWidth;
            var tileIdx = MathExt.coordinatesToIndex(startPos[1], startPos[0], width);
            carSettings[i] = {
                startPos: startPos,
                endPos: endPos
            };
            colorSettings.cars[i] = {
                color: '#'+Math.floor(Math.random()*16777215).toString(16)
            }
            if(tileSettings[tileIdx]) {
                tileSettings[tileIdx].carIdx = i;
            } else {
                tileSettings[tileIdx] = {
                    traversable: true,
                    crowdSourcer: undefined,
                    carIdx: i
                }
            }
        }
        var settings = this.world.settings;
        var worldBuilder = new SimulationWorld.Builder();
        worldBuilder.applySettings(settings);
        worldBuilder.applyCarSettings(carSettings);
        worldBuilder.applyColorSettings(colorSettings);
        var world = worldBuilder.build();
        var serialziedWorld = world.serialize();

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