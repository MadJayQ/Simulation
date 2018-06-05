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


class App {
    constructor() {
        this.paths = [];
        this.ends = [];
        this.gridSize = 5;
        this.numCars = 4;
        this.world = new World.Builder().fromSettings(Settings).build();
    }
    
    initialize() {
        this.grid = new Grid(this.gridSize, this.numCars);

        //ipcMain.send('asynchronous-message', [].concat.apply([], this.grid.grid));
        var self = this;
        ipcMain.on('ondragstart', (event, filePath) => {
            var fsextra = require('fs-extra');
            var options = {
                overwrite: true
            };
            fsextra.copySync(filePath, path.resolve(__dirname, '../scripts/model.py'), {overwrite: true});
            self.buildPaths(event);
            event.sender.startDrag({
              file: filePath,
              icon: '/assets/upload_icon.png'
            });
        });
        this.buildPaths();
        var self = this;
        ipcMain.on('synchronous-message', (event, arg) => {
            if(arg == "grid") {
                var data = {
                    numCars: this.grid.numCars,
                    size: this.grid.size,
                    gridData: [].concat.apply([], this.grid.grid)
                };
                console.log(JSON.stringify(data));
                event.returnValue = JSON.stringify(data);
            }
            if(arg == "query-time") {
                var max = -999999;
                for(var i = 0; i < this.paths.length; i++) {
                    if(this.paths[i].length > max) {
                        max = this.paths[i].length;
                    }
                }
                event.returnValue = (max - 1);
            }
            if(arg == "restart-pyshell") {
                this.buildPaths(event);
            }
            if(arg.startsWith("query-path-")) {
                var car = Number(arg.replace("query-path-", ''));
                event.returnValue = "";
            }
            if(arg.startsWith("update-simulation-grid-size-")) {
                var gridSize = Buffer.from(
                    arg.replace("update-simulation-grid-size-", ''),
                    'base64'
                ).toString('ascii');
                this.gridSize = Number(gridSize);
                while(this.grid.grid.length < this.gridSize) {
                    var list = [];
                    for(var i = 0; i < this.gridSize; i++) {
                        list[i] = 0;
                    }
                    this.grid.grid.push(list);
                }
                for(var i = 0; i < this.grid.grid.length; i++) {
                    var row = this.grid.grid[i];
                    while(row.length < this.gridSize) {
                        row.push(0);
                    }
                }
                this.grid = new Grid(this.gridSize, this.numCars, [].concat.apply([], this.grid.grid));
                event.returnValue = "";
            }
            if(arg.startsWith("simulation-update-grid-")) {
                console.log(arg);
                var gridData = arg.replace("simulation-update-grid-", '');
                gridData = Buffer.from(gridData, 'base64').toString('ascii');
                var grid = JSON.parse(gridData);
                this.numCars = grid.numCars;
                this.gridSize = grid.size;
                this.grid = new Grid(grid.size, grid.numCars, grid.gridData);
                this.buildPaths(event);
            }
            if(arg.startsWith("query-simulation-")) {
                var format = wNumb({decimals: 2});
                var time = format.from(arg.replace("query-simulation-", ''));
                console.log(time);
                var data = {

                };
                for(var i = 0; i < self.grid.numCars; i++) {
                    var idx = Math.floor(time);
                    var frac = time - Math.floor(time);
                    var next = idx + 1;
                    if(self.paths[i] == undefined) {
                        continue;
                    }
                    if(idx >= self.paths[i].length) {
                        idx = self.paths[i].length - 1;
                    }
                    if(next >= self.paths[i].length) {
                        next = self.paths[i].length - 1;
                    }
                    data[i] = {};
                    if(self.paths[i][idx]) {
                        if(self.paths[i][idx][0] < (self.paths[i][next][0])) {
                            data[i]["frac_y"] = frac;
                        }
                        else {
                            data[i]["frac_y"] = 0.0;
                        }
                        if(self.paths[i][idx][1] < self.paths[i][next][1]) {
                            data[i]["frac_x"] = frac;
                        } else {
                            data[i]["frac_x"] = 0.0;
                        }
                    }
                    data[i]["path"] = self.paths[i];
                    data[i]["idx"] = idx;
                }
                console.log(JSON.stringify(data));
                event.returnValue = JSON.stringify(data);
            }
        });
        //this.canvas = $("#draw-canvas").get(0);
        //this.ctx = this.canvas.getContext("2d");
        return true;
    }
    buildPaths(event) {
        var merged = [].concat.apply([], this.grid.grid);
        //console.log(merged);
        if(this.pyshell) {
            this.pyshell.terminate();
            this.pyshell = null;
        }
        this.waiting = true;
        this.pyshell = new python('/scripts/exec.py', {pythonOptions: ['-B'], args: [merged, this.grid.size, this.grid.numCars]});
        this.pyshell.stdout.on('data', (data) => {
            try {
                var dat = JSON.parse(data);
                for(var i = 1; i <= this.grid.numCars; i++) {
                    this.paths[i - 1] = dat[i]["path"];
                    this.ends[i - 1] = dat[i]["end"];
                    console.log(dat[i]["path"]);
                }
                if(event !== undefined) {
                    event.returnValue = 0;
                }
            } catch(err) {
                console.log("NOT JSON: " + data + ":" + err);
            }
        });
        this.pyshell.send('start').end();
    }
    exec() {

    }
}


var app = new App();
if(app.initialize()) {
    app.exec();
}