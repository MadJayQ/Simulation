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
                        "<label for=\"x-input\">X:</label>" + 
                        "<input id=\"x-input\" type=\"text\"></input>" +
                        "<label for=\"y-input\">Y:</label>" + 
                        "<input id=\"y-input\" type=\"text\"></input>" +
                        "</div>" +
                        "</div>";

function createCarTab(carNum) {
    var tabHtml = (' ' + tabTemplate).slice(1);
    tabHtml = tabHtml.split("%CARNUM%").join(carNum);
    var panel = $(tabHtml);
    $("#car-panel").append(panel);
    $("#car-" + carNum + "-body").append(
        $(carEditorTemplate)
    );
}


$(() => {
    var visualizer = require('./visualizer.js');
    var grid = visualizer.grid.gridData;
    for(var i = 0; i < grid.length; i++) {
        var carIdx = Math.abs(grid[i]);
        if(carIdx != 0) {
            if(!cars.has(carIdx)) {
                cars.set(carIdx, createCarTab(carIdx));
            }
        }
    }
});