const {ipcRenderer} = require('electron');

var cars = new Map();
var tabTemplate = "<div id=\"panel-%CARNUM%\" class=\"panel-heading\"> " + 
    "<h6 class=\"panel title\"> " +
        "<a data-toggle=\"collapse\" href=\"#car-%CARNUM%-sub\">Car %CARNUM%</a> " +
    "</h6>" +
"</div>" +
"<div id=\"car-%CARNUM%-sub\" class=\"panel-collapse collapse\">" + 
"<div id=\"car-%CARNUM%-body\" class=\"panel-body\"></div>" + 
"<div id=\"car-%CARNUM%-footer\" class=\"panel-footer\"><button id=\"carApplyBtn-%CARNUM%\" class=\"btn\">Apply Changes</button><button id=\"carDeleteBtn-%CARNUM%\"class=\"btn\" style=\"margin-left: 10%;\">Delete</button></div>" +
"</div>";

var carEditorTemplate = "<div class=\"container-fluid\">" + 
                        "<form style=\"display: table\">" +
                        "<p style=\"display: table-row\">" + 
                        "<label style=\"display: table-cell\">X:</label>" + 
                        "<input style=\"display: table-cell\" id=\"x-input-%CARNUM%\" type=\"text\"></input>" +
                        "<label style=\"display: table-cell; padding-left: 5rem;\">X`:</label>" + 
                        "<input style=\"display: table-cell\" id=\"x-input-%CARNUM%-end\" type=\"text\"></input>" +
                        "</p>" +
                        "<p style=\"display: table-row\">" + 
                        "<label style=\"display: table-cell\">Y:</label>" + 
                        "<input style=\"display: table-cell\" id=\"y-input-%CARNUM%\" type=\"text\"></input>" +
                        "<label style=\"display: table-cell; padding-left: 5rem;\">Y`:</label>" + 
                        "<input style=\"display: table-cell\" id=\"y-input-%CARNUM%-end\" type=\"text\"></input>" +
                        "</p>" +
                        "</form>" +
                        "</div>";


function changeCarPos(carNum, startPos, endPos) {
    var grid = visualizer.requeryGrid();
    for(var i = 0; i < grid.gridData.length; i++) {
        if(grid.gridData[i] == carNum || grid.gridData[i] == -carNum) {
            grid.gridData[i] = 0;
        }
    }
    var startIdx = startPos[1] * grid.size + startPos[0];
    var endIdx = endPos[1] * grid.size + endPos[0];

    if(carNum > grid.numCars) {
        grid.numCars = carNum;
    }
    grid.gridData[startIdx] = carNum;
    grid.gridData[endIdx] = -carNum;

    var gridJSON = JSON.stringify(grid);
    var updateString = "simulation-update-grid-";
    updateString += Buffer.from(gridJSON).toString('base64');
    ipcRenderer.sendSync('synchronous-message', updateString);
    visualizer.requeryGrid();
    visualizer.drawSimulation();
}

function deleteCar(carNum) {
    var grid = visualizer.requeryGrid();
    for(var i = 0; i < grid.gridData.length; i++) {
        if(grid.gridData[i] == carNum || grid.gridData[i] == -carNum) {
            grid.gridData[i] = 0;
        }
    }
    var gridJSON = JSON.stringify(grid);
    var updateString = "simulation-update-grid-";
    updateString += Buffer.from(gridJSON).toString('base64');
    ipcRenderer.sendSync('synchronous-message', updateString);
    visualizer.requeryGrid();
    visualizer.drawSimulation();

}
                        
function createCarTab(carNum, grid) {
    var tabHtml = (' ' + tabTemplate).slice(1);
    tabHtml = tabHtml.split("%CARNUM%").join(carNum);
    var panel = $(tabHtml);
    $("#car-panel").append(panel);
    $("#car-" + carNum + "-body").append(
        $(carEditorTemplate.split("%CARNUM%").join(carNum))
    );
    $("#carApplyBtn-" + carNum).click((e) => {
        changeCarPos(
            carNum,
            [Number($("#x-input-" + carNum).val()), Number($("#y-input-" + carNum).val())],
            [Number($("#x-input-" + carNum + "-end").val()), Number($("#y-input-" + carNum + "-end").val())]
        );
    });
    $("#carDeleteBtn-" + carNum).click((e) => {
        $("#car-panel").children("#panel-" + carNum).remove();
        $("#car-panel").children("#car-" + carNum + "-sub").remove();
        deleteCar(carNum);
    });
    return panel;
}

var visualizer = require('./visualizer.js');

function gridSizeChanged(e) {
    visualizer = require('./visualizer.js');
    var updateString = "update-simulation-grid-size-";
    updateString += Buffer.from($("#size-input").val()).toString('base64');
    ipcRenderer.sendSync('synchronous-message', updateString);
    visualizer.requeryGrid();
    visualizer.drawSimulation();
}
function newCar(e) {
    var grid = visualizer.grid;
    var newCar = ++grid.numCars;
    cars.set(newCar, {
        pos: [newCar - 1, 0],
        endPos: [newCar -1, grid.size - 1],
        tab: createCarTab(newCar, visualizer.grid)
    });

}
$(() => {
    return;
    var grid = visualizer.grid.gridData;
    for(var i = 0; i < grid.length; i++) {
        var carIdx = grid[i];
        var isEnd = (carIdx < 0);
        carIdx = Math.abs(carIdx);
        if(carIdx != 0) {
            if(!cars.has(carIdx)) {
                cars.set(carIdx, {
                    pos: [Math.floor(i / visualizer.grid.size), i % visualizer.grid.size],
                    tab: createCarTab(carIdx, visualizer.grid)
                });
                console.log(cars.get(carIdx));
                $("#x-input-" + carIdx).val(cars.get(carIdx).pos[1]);
                $("#y-input-" + carIdx).val(cars.get(carIdx).pos[0]);
            }
            else if(isEnd) {
                var car = cars.get(carIdx);
                car.endPos = [Math.floor(i / visualizer.grid.size), i % visualizer.grid.size];
                cars.set(carIdx, car);
                $("#x-input-" + carIdx + "-end").val(cars.get(carIdx).endPos[1]);
                $("#y-input-" + carIdx + "-end").val(cars.get(carIdx).endPos[0]);
            }
        }
    }
    console.log(cars);
    $("#size-input").val(visualizer.grid.size);
    $("#gridApplyBtn").click(gridSizeChanged);
    $("#newCarBtn").click(newCar);
});