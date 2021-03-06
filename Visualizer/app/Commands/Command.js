var NetMsg = require('./NetMsg.js');
var SimulationWorld = require('../Simulation/World.js');
const MathExt = require('../math.js')
const fs = require("fs");

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

class ReportCommand extends Command {
    constructor(world, payload) {
        super("report", () => {this.execute}, payload);
        this.world = world;
    }

    execute(pipe) {
        if(this.payload !== undefined) {
            var test = this.payload;
        } else {
            var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
            pipe.sender.send("asynchronous-reply", netMsg.serialize(
                {
                    type: ReportCommand.REQ,
                    body: "INVALID REQUEST"
                }
            ));
        }
    }
    static get REQ() {
        return "report";
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
            this.world.settings.miscSettings = settingsPayload.miscSettings;
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
        var finished = this.world.isFinished();
        this.activePipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: SimulationBakeCommand.REQ,
                body: {
                    data: moveData,
                    finished: finished
                }
            }
        ));
        if(!finished) {
            this.execute(this.activePipe);
        }
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

class ResetTileStatisticCommand extends Command {
    constructor(world) {
        super("reset-statistics", () => {this.execute});
        this.payload = null;
        this.world = world;
    }

    execute(pipe) {
        this.world.resetTileStatistics();
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        pipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: ResetTileStatisticCommand.REQ,
                body: ""
            }
        ));
    }

    static get REQ() {
        return "reset-statistics";
    }
}

class ParseMapFileCommand extends Command {
    constructor(world, payload) {
        super("parse-map", () => {this.execute}, payload);
        this.world = world;
    }

    execute(pipe) {
        if(this.payload !== undefined) {
            var mapName = this.payload.toString();
            var edges = JSON.parse(fs.readFileSync('./maps/' + mapName + '/edges.json'), 'utf8');
            var junctions = JSON.parse(fs.readFileSync('./maps/' + mapName + '/junctions.json', 'utf8'));
            this.world.parseRoadMap(edges, junctions);
            var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
            pipe.sender.send("asynchronous-reply", netMsg.serialize(
                {
                    type: ParseMapFileCommand.REQ,
                    body: "OK"
                }
            ));

        }
        else {
            pipe.sender.send("asynchronous-reply", netMsg.serialize(
                {
                    type: ParseMapFileCommand.REQ,
                    body: "FAIL"
                }
            ));
        }
    }

    static get REQ() {
        return "parse-map";
    }
}

class CreateTestCaseCommand extends Command {
    constructor(world) {
        super("testcase-world", () => {this.execute});
        this.world = world;
    }

    execute(pipe) {
        var w = 20;
        var h = 20;
        var numCars = 5;
        var carSettings = {};
        var tileSettings = {};
        
        var tileStarts = [262, 325, 25, 36, 80];
        var endTiles = [109, 173, 35, 294, 262];

        
        this.world.tiles = [];
        this.world.tileData = undefined;
        this.world.constructTiles(w, h);
        
        for(var i = 0; i < numCars; i++) {
            var startPos = this.world.tiles[tileStarts[i]].pos;
            var endPos = this.world.tiles[endTiles[i]].pos
            carSettings[i] = {
                startPos: startPos,
                endPos: endPos,
                capacity: 5000
            };
        }
        
        this.world.settings.worldSettings.tileWidth = w;
        this.world.settings.worldSettings.tileHeight = h;
        
        this.world.settings.carSettings = carSettings;
        this.world.settings.tileSettings = tileSettings;
        this.world.width = w;
        this.world.height = h;
        this.world.applySettings();
        this.world.setCarCapacity();
        
        
        var commandCtx = this;
        var worldCtx = this.world;
        var rewardMask = new require('png-js').load("reward_mask.png");
        rewardMask.decode((pixels) => {
            var weights = new Array(commandCtx.world.tiles.length);
            var pixelCounter = 0;
            for(var i = 0; i < pixels.length; i+=4) { //Forget alpha channel
                var pixelData = [
                    pixels[i], pixels[i + 1], pixels[i + 2]
                ];
                var weight = ((pixelData[0] + pixelData[1] + pixelData[2]) / 3) / 255;
                weights[pixelCounter++] = weight;
            }
            //worldCtx.distributeBudget(0, 0, weights);
            worldCtx.distributeBudget(0, 0, [
                [10, 10]
            ]);
            
            var serialziedWorld = worldCtx.serialize();
            var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
            pipe.sender.send("asynchronous-reply", netMsg.serialize(
                {
                    type: CreateTestCaseCommand.REQ,
                    body: serialziedWorld
                }
            ));

        });
        console.log("DONE!");
    }

    static get REQ() {
        return "testcase-world"
    }
}
class RandomizeWorldCommand extends Command {
    constructor(world) {
        super("randomize-world", () => {this.execute});
        this.world = world;
    }

    execute(pipe) {
        MathExt.setRandomSeed(this.world.settings.miscSettings.seed) //Reset our sequence
        var w = this.world.width;
        var h = this.world.height;
        var numCars = MathExt.seededRandInt(this.world.settings.worldSettings.minCars, this.world.settings.worldSettings.maxCars);
        var carSettings = {};
        var colorSettings = {};
        var tileSettings = {};

        var spawnTileBucket = [];
        var dstTileBucket = [];
        var numTiles = this.world.tiles.length;
        
        for(var i = 0; i < this.world.tiles.length; i++) {
            var tile = this.world.tiles[i];
            var numSpawnTickets = Math.round(tile.spawnChance * numTiles);
            var numDstTickets = Math.round(tile.dstChance * numTiles);

            var spawnTickets = Array(numSpawnTickets).fill(tile.tID);
            var dstTickets = Array(numDstTickets).fill(tile.tID);

            spawnTileBucket = spawnTileBucket.concat(
                spawnTickets
            );

            dstTileBucket = dstTileBucket.concat(
                dstTickets
            );
        }
        
        for(var i = 0; i < numCars; i++) {
            var startIdx = spawnTileBucket[MathExt.seededRandInt(0, spawnTileBucket.length)];
            var endIdx = dstTileBucket[MathExt.seededRandInt(0, dstTileBucket.length)];
            var startTile = this.world.tiles[startIdx];
            var endTile = this.world.tiles[endIdx];
            var startPos = startTile.pos;
            var endPos = endTile.pos;
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
        this.world.setCarCapacity();
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
module.exports.ReportCommand = ReportCommand;
module.exports.ResetTileStatisticCommand = ResetTileStatisticCommand;
module.exports.ParseMapFileCommand = ParseMapFileCommand;
module.exports.CreateTestCaseCommand = CreateTestCaseCommand;