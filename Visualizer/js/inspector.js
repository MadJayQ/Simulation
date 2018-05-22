const {ipcRenderer} = require('electron');

var cars = new Map();
var tabTemplate = "<div class=\"panel-heading\"> " + 
    "<h6 class=\"panel title\"> " +
        "<a data-toggle=\"collapse\" href=\"#car-%CARNUM%-sub\">Car %CARNUM%</a> " +
    "</h6>" +
"</div>" +
"<div id=\"car-%CARNUM%-sub\" class=\"panel-collapse collapse\">" + 
"<div id=\"car-%CARNUM%-body\" class=\"panel-body\"></div>" + 
"</div>";

var carEditorTemplate = "<div class=\"container-fluid\">" + 
                        "<div class=\"row\">" + 
                        "<label for=\"x-input-%CARNUM%\">X:</label>" + 
                        "<input id=\"x-input-%CARNUM%\" type=\"text\"></input>" +
                        "<label for=\"y-input-%CARNUM%\">Y:</label>" + 
                        "<input id=\"y-input-%CARNUM%\" type=\"text\"></input>" +
                        "</div>" +
                        "</div>";

function createCarTab(carNum, grid) {
    var tabHtml = (' ' + tabTemplate).slice(1);
    tabHtml = tabHtml.split("%CARNUM%").join(carNum);
    var panel = $(tabHtml);
    $("#car-panel").append(panel);
    $("#car-" + carNum + "-body").append(
        $(carEditorTemplate.split("%CARNUM%").join(carNum))
    );
    return panel;
}

var visualizer = require('./visualizer.js');

function gridSizeChanged(e) {
    var updateString = "update-simulation-grid-size-";
    updateString += Buffer.from($("#size-input").val()).toString('base64');
    ipcRenderer.sendSync('synchronous-message', updateString);
    visualizer.requeryGrid();
    visualizer.drawSimulation();
}

$(() => {
    var grid = visualizer.grid.gridData;
    for(var i = 0; i < grid.length; i++) {
        var carIdx = Math.abs(grid[i]);
        if(carIdx != 0) {
            if(!cars.has(carIdx)) {
                cars.set(carIdx, {
                    pos: [Math.floor(i / visualizer.grid.size), i % visualizer.grid.size],
                    tab: createCarTab(carIdx, visualizer.grid)
                });
                console.log(cars.get(carIdx));
                $("#x-input-" + carIdx).val(cars.get(carIdx).pos[0]);
                $("#y-input-" + carIdx).val(cars.get(carIdx).pos[1]);
            }
        }
    }
    $("#size-input").val(visualizer.grid.size);
    $("#gridApplyBtn").click(gridSizeChanged);
});