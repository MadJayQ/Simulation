// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const noUiSlider = require('nouislider')
const {ipcRenderer} = require('electron');
const wNumb = require('wNumb');

var slider = document.getElementById('time-scrubber');
var time = 0.0;
var lasttime = undefined;


/*
    Setup Slider UI
*/
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

/*
    Setup Python Module Drag-N-Drop
*/

var dropzone = $("#dropzone").get(0);
var canvas = $("#draw-canvas").get(0);
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

var colors = ['red', 'blue', 'green', 'white', 'black'];

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

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
	
	console.log(values);
	
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
	
	function clickOnPip ( ) {
			var value = Number(this.getAttribute('data-value'));
			slider.noUiSlider.set(value);
			var currentVal = slider.noUiSlider.options.format.from(slider.noUiSlider.get());
	}
	
	for ( var i = 0; i < pips.length; i++ ) {
	
			// For this example. Do this in CSS!
			pips[i].style.cursor = 'pointer';
			pips[i].addEventListener('click', clickOnPip);
	}
	
	console.log("SLIDER UPDATED!");
}

var format = wNumb({
	decimals: 2
});


function drawSimulation() {
	var ctx = canvas.getContext("2d");
	var size = grid["size"];
	var numCars = grid["numCars"];
	var gridData = grid["gridData"];
	var w = canvas.width / size;
	var h = canvas.height / size;
	
	var timeStr = "query-simulation-" + time;
	var simulation = JSON.parse(ipcRenderer.sendSync('synchronous-message', timeStr));

	for(var i = 0; i < gridData.length; i++) {
		console.log(size);
		var row = Math.floor(i / size);
		var col = i % size;
		var color = colors[(col + row) % size];
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.rect(col * w, row * h, w, h);
		ctx.fill();
		ctx.stroke();
	}
	for(var j = 0; j < numCars; j++) {
		ctx.strokeStyle = 'black';
		var fracx = 0.0;
		var fracy = 0.0;
		var row = simulation[j]["path"][0];
		var col = simulation[j]["path"][1];
		ctx.fillStyle = colors[j];
		fracx = simulation[j]["frac_x"] || 0;
		fracy = simulation[j]["frac_y"] || 0;
		ctx.beginPath();
		ctx.rect((col * w) + (fracx * w), (row * h) + (fracy * h), w, h);
		ctx.fill();
		ctx.stroke();
	}
}

slider.noUiSlider.on('slide.one', function(){
	//time = slider.noUiSlider.get();
	//drawSimulation();
});

slider.noUiSlider.on('update.one', () => {
	time = slider.noUiSlider.get();
	console.log(time);
	drawSimulation();
});

ipcRenderer.on('asynchronous-reply', (event, arg) => {
	console.log(arg);
});

updateSlider();
drawSimulation();