const noUiSlider = require('nouislider')
const {ipcRenderer} = require('electron');
const wNumb = require('wNumb');

const MoveData = require('./movedata.js');
const prompt = require('electron-prompt');

var slider = $("#time-scrubber").get(0);

var dropzone = $("#dropzone").get(0);
var canvas = $("#draw-canvas").get(0);
var ctx = canvas.getContext("2d");


var newMap = false;

/*

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  $.each(
	event.dataTransfer.files,
	(index, file) => {
	  var filename = file.name;
	  var ext = filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
	  if(ext !== "py") {
		alert("Only python modules allowed!");
	  } else {
			ipcRenderer.sendSync('ondragstart', file.path);
			updateSlider();
	  }
	}
  )
});
dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
});


var grid = JSON.parse(ipcRenderer.sendSync('synchronous-message', 'grid'));

var colors = ['red', 'blue', 'green', 'purple', 'black', 'orange', 'cyan', 'gray'];


function requeryGrid() {
	grid = JSON.parse(ipcRenderer.sendSync('synchronous-message', 'grid'));
	return grid;
}

function clickOnPip() {
	var value = Number(this.getAttribute('data-value'));
	slider.noUiSlider.set(value);
	var currentVal = slider.noUiSlider.options.format.from(slider.noUiSlider.get());
}

function updateSlider() {
	var maxTime = ipcRenderer.sendSync('synchronous-message', 'query-time');
	var values = [];
	for(var i = 0; i < maxTime; i++) {
		values.push(i);
		values.push(i + 0.25);
		values.push(i + 0.5);
		values.push(i + 0.75);
	}
	values.push(maxTime);
	
	console.log(maxTime);
	
	slider.noUiSlider.updateOptions({
		range: {
			min: 0,
			max: maxTime
		}
	});

	slider.noUiSlider.pips({
		mode: 'values',
		values: values,
		density: maxTime,
		filter: (value, type) => {
			var decimal = (value - Math.floor(value));
			return (decimal != 0.0) ? 2 : 1;
		},
		format: wNumb({
			decimals: 2,
			suffix: 's'
		})
	});
	
	var pips = slider.querySelectorAll('.noUi-value');
	
	for ( var i = 0; i < pips.length; i++ ) {
			pips[i].style.cursor = 'pointer';
			pips[i].addEventListener('click', clickOnPip);
	}
}

var format = wNumb({
	decimals: 2
});


function isInGrid(carNum, grid) {
	for(var i = 0; i < grid.length; i++) {
		if(grid[i] == carNum || grid[i] == -carNum) {
			return true;
		}
	}
	return false;
}

function drawSimulation() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
	var ctx = canvas.getContext("2d");
	var size = grid["size"];
	var numCars = grid["numCars"];
	var gridData = grid["gridData"];
	var w = canvas.width / size;
	var h = canvas.height / size;
	
	var timeStr = "query-simulation-" + time;
	var simulation = JSON.parse(ipcRenderer.sendSync('synchronous-message', timeStr));

	for(var i = 0; i < gridData.length; i++) {
		var row = Math.floor(i / size);
		var col = i % size;
		var color = colors[((col + row) % size)];
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.rect(col * w, row * h, w, h);
		ctx.fill();
		ctx.stroke();
	}
	for(var j = 0; j < numCars; j++) {
		if(!isInGrid(j + 1, gridData)) continue;
		ctx.strokeStyle = 'black';
		var fracx = 0.0;
		var fracy = 0.0;
		var idx = Number(simulation[j]["idx"]);
		var row = simulation[j]["path"][idx][0];
		var col = simulation[j]["path"][idx][1];
		ctx.fillStyle = colors[j % colors.length];
		fracx = simulation[j]["frac_x"] || 0;
		fracy = simulation[j]["frac_y"] || 0;
		var path = simulation[j]["path"];
		for(var i = 0; i < path.length; i++) {
			var prow = path[i][0];
			var pcol = path[i][1];
			ctx.beginPath();
			ctx.arc((pcol * w) + (w / 2), (prow * h) + (h / 2), 5, 0, 360, false);
			ctx.fill();
			ctx.stroke();
			if(i > 0) {
				var prevRow = path[i - 1][0];
				var prevCol = path[i - 1][1];
				ctx.beginPath();
				ctx.strokeStyle = colors[j];
				ctx.moveTo((prevCol * w) + (w / 2), (prevRow * h) + (h / 2));
				ctx.lineTo((pcol * w) + (w / 2), (prow * h) + (h / 2));
				ctx.stroke();
				ctx.strokeStyle = "black";
			}
		}
		ctx.beginPath();
		ctx.rect((col * w) + (fracx * w), (row * h) + (fracy * h), w, h);
		ctx.fill();
		ctx.stroke();
		console.log(j);
		ctx.font = '20px serif';
		ctx.fillStyle = 'white';
		ctx.fillText("Car " + (j + 1), (col * w) + (fracx * w) + (w / 4), (row * h) + (fracy * h) + (h / 2), w);
	}
}

module.exports.updateSlider = updateSlider;
module.exports.drawSimulation = drawSimulation;
module.exports.requeryGrid = requeryGrid;
module.exports.grid = grid;


$(() => {
	$(window).bind("resize", () => {
		drawSimulation();
	});
    if(slider) {
        noUiSlider.create(slider, {
            start: [0],
            connect: true,
            range: {
                'min': 0,
                'max': 100
            },
            tooltips: true,
            format: wNumb({
                decimals: 2,
                prefix: 't='
            })
        });
        slider.noUiSlider.on('slide.one', function(){
            //time = slider.noUiSlider.get();
            //drawSimulation();
        });
        
        slider.noUiSlider.on('update.one', () => {
            time = slider.noUiSlider.get();
            drawSimulation();
        });
        
        ipcRenderer.on('asynchronous-reply', (event, arg) => {

        });
        updateSlider();
    }
    drawSimulation();
});
*/

const Commands = require('../app/Commands/Command.js');
const NetMsg = require('../app/Commands/NetMsg.js');
const SimulationWorld = require('../app/Simulation/World.js');
const TimeScrubberModule = require('./timescrubber.js');
const Inspector = require('./inspector.js');
const MathExt = require('../app/math.js');

var mapFile = 'choose3';

var DrawModes = {
	DRAWMODE_REGULAR: 0,
	DRAWMODE_EDITOR: 1,
	DRAWMODE_HEATMAP: 2
};
class VisualizerApplet {

	constructor(ipcPipe) {
		this.ipcPipe = ipcPipe;
		this.simulationWorld = null;
		this.timeScrubber = new TimeScrubberModule(undefined, ipcPipe);
		this.heatmap = false;
		this.drawmode = DrawModes.DRAWMODE_REGULAR;
	
	}

	initialize() {
		var thisPtr = this;
		canvas.addEventListener("mousemove", (event) => { 
			thisPtr.onCanvasMove.apply(thisPtr, [event])
		}
	);
		this.ipcPipe.on("asynchronous-reply", (event, arg) => {
			var possibleCommand = new NetMsg.Verify(arg);
			if(possibleCommand.isMessage()) {
				switch(possibleCommand.messageObj.type) {
					case NetMsg.Type.TYPE_COMMAND_RESPONSE: {
						this.handleCommandResponse(possibleCommand.messageObj.body);
					}
				}
			}	
		})
	}

	onCarHover(carPanel) {
		var carIdx = Number(carPanel[1].id.split("-")[1]);
		if(carIdx != NaN) {
			var car = this.simulationWorld.cars[carIdx];
			var startIdx = MathExt.coordinatesToIndex(car.startPos[1], car.startPos[0], this.simulationWorld.width);
			var endIdx = MathExt.coordinatesToIndex(car.endPos[1], car.endPos[0], this.simulationWorld.width);
			this.simulationWorld.tiles[startIdx].color = 'green';
			this.simulationWorld.tiles[endIdx].color = 'red';
			this.drawSimulation();
		}
	}

	onCarHoverLeave(carPanel) {
		var carIdx = Number(carPanel[1].id.split("-")[1]);
		if(carIdx != NaN) {
			var car = this.simulationWorld.cars[carIdx];
			var startIdx = MathExt.coordinatesToIndex(car.startPos[1], car.startPos[0], this.simulationWorld.width);
			var endIdx = MathExt.coordinatesToIndex(car.endPos[1], car.endPos[0], this.simulationWorld.width);
			this.simulationWorld.tiles[startIdx].color = 'white';
			this.simulationWorld.tiles[endIdx].color = 'white';
			this.drawSimulation();
		}
	}

	onCanvasMove(event) {
		var translateEventCoordinates = (event, canvas) => {
			var x = event.clientX; // x coordinate of a mouse pointer
			var y = event.clientY; // y coordinate of a mouse pointer
			var rect = event.target.getBoundingClientRect();
			x = (x - rect.left);
			y = (y - rect.top);
	
			return {
				x: x,
				y: y
			};
		}
		var coordinates = translateEventCoordinates(event, canvas);
		var gridSize = {
			x: canvas.width / this.simulationWorld.width,
			y: canvas.height / this.simulationWorld.height,
		};
		var x = Math.floor(coordinates.x / gridSize.x);
		var y = Math.floor(coordinates.y / gridSize.y);
		var selectedTile = MathExt.coordinatesToIndex(y, x, this.simulationWorld.width);
		this.selectedTile = selectedTile;
		$("#ci-budget").val(this.simulationWorld.tiles[selectedTile].reward);
		$("#ci-visited").val(this.simulationWorld.tiles[selectedTile].numVisited);
		$("#cellidx").text(this.selectedTile.toString());
	}
	
	handleCommandResponse(response) {
		switch(response.type) {
			case "grid-request": {
				var jsonWorld = JSON.parse(response.body);
				var world = new SimulationWorld.Builder();
				this.simulationWorld = world.deserializeWorld(jsonWorld).build();
				this.drawSimulation();
				if(!this.timeScrubber.initialized) {
					this.timeScrubber.initialize(this.simulationWorld.settings.timeSettings);
					this.timeScrubber.construct();
				}
				break;
			}
			case Commands.SimulationBakeCommand.REQ: {
				var moveData = response.body.data;
				var finished = response.body.finished;
				this.simulationWorld.executeMove(moveData);
				var move = JSON.parse(moveData);
				MoveData.getInstance().addMove(move);
				Inspector.requestCarUpdate();
				this.drawSimulation();
				if(finished) {
					Inspector.requestNextSimulation();
				}
				break;
			}
			case Commands.MaximumTimeSensingCommand.REQ: {
				break;
			}
			case Commands.SettingsCommand.REQ: {
				Inspector.setDefaults(response.body);
				break;
			}
			case Commands.CarsCommand.REQ: {
				Inspector.populateCars(response.body);
				break;
			}
			case Commands.CreateTestCaseCommand.REQ:
			case Commands.RandomizeWorldCommand.REQ: {
				var jsonWorld = JSON.parse(response.body);
				var world = new SimulationWorld.Builder();
				this.simulationWorld = world.deserializeWorld(jsonWorld).build();
				MoveData.getInstance().newSimulation(this.simulationWorld.settings);
				Inspector.requestCarUpdate();
				this.drawSimulation();
				break;
			}
			case Commands.ParseMapFileCommand.REQ: {
				var status = response.body;
				if(status == "OK") {
					new Commands.GridCommand(null).issueRequest(ipcRenderer);
				} else {
					console.error("SOMETHING WENT HORRIBLY WRONG!"); 
				}
				break;
			}
			default: break;
		}
	}

	changeMapFile() {
		prompt({
        	title: 'New Map',
        	label: 'New Map File:',
			type: 'input'
		}).then((r) => {
			if(r != null) {
				new Commands.ParseMapFileCommand(null, r).issueRequest(ipcRenderer);
			}
		})
		/*
		var mapFileName = prompt("Enter a mapfile name:");
		new Commands.ParseMapFileCommand(null, mapFileName).issueRequest(ipcRenderer);
		*/
	}

	drawSimulation() {
		if(newMap) {
			this.drawNewSimulation();
			return;
		}
		if(this.simulationWorld == null) {
			return;
		}
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		switch(this.drawmode) {
			case DrawModes.DRAWMODE_REGULAR: this.simulationWorld.draw(ctx); break;
			case DrawModes.DRAWMODE_EDITOR: this.simulationWorld.drawMapEditor(ctx); break;
			case DrawModes.DRAWMODE_HEATMAP: this.simulationWorld.drawHeatmap(ctx); break;
		}
	}

	//This method is temporary, it will be condensed into the drawSimulationMethod
	drawNewSimulation() {
		if(this.simulationWorld == null) {
			return;
		}
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;

		this.simulationWorld.drawNodes(ctx);
	}
}




$(() => {
	var app = new VisualizerApplet(ipcRenderer);
	app.initialize();
	module.exports.app = app;
	$(window).bind("resize", () => {
		app.drawSimulation();
	});
	var netCmd = new Commands.GridCommand();
	netCmd.issueRequest(ipcRenderer);

	$("#simulation-Randomize").click(() => {
		var netCmd = new Commands.RandomizeWorldCommand();
		netCmd.issueRequest(ipcRenderer);
	});
	$("#simulation-TestCase").click(() => {
		var netCmd = new Commands.CreateTestCaseCommand();
		netCmd.issueRequest(ipcRenderer);
	});

	$("#toggleStyle").click(() => {
		newMap = !newMap;
		app.drawSimulation();
	});

	$("#newMapFile").click(() => {
		app.changeMapFile();
	});

	$("#ciResetBtn").click(() => {
		var netCmd = new Commands.ResetTileStatisticCommand();
		app.drawmode = DrawModes.DRAWMODE_REGULAR;
		netCmd.issueRequest(ipcRenderer); //Reset our stats
	});
	$("#liDrawmodeRegular").click(() => {
		app.drawmode = DrawModes.DRAWMODE_REGULAR;
		app.drawSimulation();
	});
	$("#liDrawmodeEditor").click(() => {
		app.drawmode = DrawModes.DRAWMODE_EDITOR;
		app.drawSimulation();
	});
	$("#liDrawmodeHeatmap").click(() => {
		app.drawmode = DrawModes.DRAWMODE_HEATMAP
		app.drawSimulation();
	});
	$("#exportBtn").click(() => {
		MoveData.getInstance().export();
	});
});