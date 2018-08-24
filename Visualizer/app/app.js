const $ = require("jquery");
const fs = require("fs");
const path = require("path");
var Grid = require('./grid.js');
const python = require('python-shell');

const { ipcMain } = require('electron')
const wNumb = require('wNumb');

const Car = require('./Simulation/Car.js');
const World = require('./Simulation/World.js');
const Settings = require('./Settings/Settings.js');
const TileSettings = require('./Settings/TileSettings.js');
const CarSettings = require('./Settings/CarSettings.js');
const CrowdSourcerSettings = require('./Settings/CrowdSourcerSettings.js');
const ColorSettings = require('./Settings/ColorSettings.js');

const PythonInterpreter = require('./Commands/PythonInterpreter.js');
const CommandInterpreter = require('./Commands/CommandInterpreter.js');
const Commands = require('./Commands/Command.js');
const MathExt = require('./math.js');

class App {
    constructor() {
        this.paths = [];
        this.ends = [];
        this.gridSize = 5;
        this.numCars = 4;
    }
    
    initialize() {
        this.world = new World.Builder().
                    applySettings(Settings).
                    applyTileSettings(TileSettings).
                    applyCrowdSourcerSettings(CrowdSourcerSettings).
                    applyCarSettings(CarSettings).
                    applyColorSettings(ColorSettings).
                    build();
        this.commandInterpreter = new CommandInterpreter(ipcMain);
        this.pythonInterpreter = new PythonInterpreter('/scripts/exec.py'); //Create our executor
        this.commandInterpreter.registerCommands([
            new Commands.GridCommand(this.world),
            new Commands.SimulationBakeCommand(this.world, this.pythonInterpreter),
            new Commands.MaximumTimeSensingCommand(this.world, this.pythonInterpreter),
            new Commands.RandomizeWorldCommand(this.world),
            new Commands.SettingsCommand(this.world, undefined),
            new Commands.CarsCommand(this.world)]
        );

        var gen = require('random-seed');
        var rand1 = gen.create("Hello World");
        for(var i = 0; i < 3; i++) {
            var num = rand1.intBetween(0, 10);
        }
        rand1 = gen.create("adfsadfsdf");
        for(var i = 0; i < 3; i++) {
            var num2 = rand1.intBetween(0, 10);
        }
        rand1 = gen.create("adfsadfsdf");
        for(var i = 0; i < 3; i++) {
            var num3 = rand1.intBetween(0, 10);
        }
        return true;
    }
    exec() {
        this.commandInterpreter.onCommand(Commands.MaximumTimeSensingCommand.REQ, false);
    }
}


var app = new App();
if(app.initialize()) {
    app.exec();
}