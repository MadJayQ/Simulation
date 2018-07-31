const {ipcRenderer} = require('electron');

const Commands = require('../app/Commands/Command.js');
const NetMsg = require('../app/Commands/NetMsg.js');

var cars = new Map();
var tabTemplate = "<div id=\"panel-%CARNUM%\" class=\"panel-heading\"> " + 
    "<h6 class=\"panel title\"> " +
        "<a data-toggle=\"collapse\" href=\"#car-%CARNUM%-sub\">Car %CARNUM%</a> " +
    "</h6>" +
"</div>" +
"<div id=\"car-%CARNUM%-sub\" class=\"panel-collapse collapse\">" + 
"<div id=\"car-%CARNUM%-body\" class=\"panel-body\"></div>" + 
"</div>";

var carEditorTemplate = "<div class=\"container-fluid\">" + 
                        "<p style=\"display: table-row\">" + 
                        "<label style=\"display: table-cell\">Start Pos:</label>" + 
                        "<input style=\"display: table-cell\" id=\"startPos-%CARNUM%\" type=\"text\"></input>" +
                        "</p>" +
                        "<p style=\"display: table-row\">" + 
                        "<label style=\"display: table-cell\">End Pos:</label>" + 
                        "<input style=\"display: table-cell\" id=\"endPos-%CARNUM%\" type=\"text\"></input>" +
                        "</p>" +
                        "<p style=\"display: table-row\">" + 
                        "<label style=\"display: table-cell\">Capacity:</label>" + 
                        "<input style=\"display: table-cell\" id=\"capacity-%CARNUM%\" type=\"text\"></input>" +
                        "</p>" +
                        "</div>";

var visualizer = require('./visualizer.js');
var app = undefined;

function worldSettingsChanged(e) {
    var worldWidth = Number($("#width-input").val());
    var worldHeight = Number($("#height-input").val());
    var minCars = Number($("#min-cars-input").val());
    var maxCars = Number($("#max-cars-input").val());
    var minCapacity = Number($("#min-capacity-input").val());
    var maxCapacity = Number($("#max-capacity-input").val());
    var minCost = Number($("#min-cost-input").val());
    var maxCost = Number($("#max-cost-input").val());

    var settings = require('../app/Settings/Settings.js');
    settings.worldSettings.tileWidth = worldWidth;
    settings.worldSettings.tileHeight = worldHeight;
    settings.worldSettings.minCars = minCars;
    settings.worldSettings.maxCars = maxCars;
    settings.worldSettings.minCapacity = minCapacity;
    settings.worldSettings.maxCapacity = maxCapacity;
    settings.worldSettings.minCost = minCost;
    settings.worldSettings.maxCost = maxCost;
    var SettingsCommand = new Commands.SettingsCommand(undefined, JSON.stringify(settings));
    SettingsCommand.issueRequest(ipcRenderer);
}

function createCarTab(num, startPos, endPos, capacity) {
    var tabHtml = (' ' + tabTemplate).slice(1);
    tabHtml = tabHtml.split("%CARNUM%").join(num);
    var panel = $(tabHtml);
    /*
    panel.mouseenter(() => {
        visualizer.app.onCarHover(panel);
    });
    panel.mouseleave(() => {
        visualizer.app.onCarHoverLeave(panel);
    })
    */
    $("#cars-panel").append(panel);
    $("#car-" + num + "-body").append(
        $(carEditorTemplate.split("%CARNUM%").join(num))
    );
    $("#startPos-" + num).val(startPos);
    $("#endPos-" + num).val(endPos);
    $("#capacity-" + num).val(capacity);
}

function populateCars(carData) {
    carData = JSON.parse(carData);
    $("#cars-panel").empty();
    for (var i = 1; i < Object.keys(carData).length; i++) {
        var car = carData[i];
        createCarTab(i, car.startPos, car.endPos, car.capacity);
    }
}

function setDefaults(defaultSettings) {
    $("#width-input").val(defaultSettings.worldSettings.tileWidth);
    $("#height-input").val(defaultSettings.worldSettings.tileHeight);
    $("#min-cars-input").val(defaultSettings.worldSettings.minCars);
    $("#max-cars-input").val(defaultSettings.worldSettings.maxCars);
    $("#min-capacity-input").val(defaultSettings.worldSettings.minCapacity);
    $("#max-capacity-input").val(defaultSettings.worldSettings.maxCapacity);
    $("#min-cost-input").val(defaultSettings.worldSettings.minCost);
    $("#max-cost-input").val(defaultSettings.worldSettings.maxCost);
}

function requestCarUpdate() {
    new Commands.CarsCommand().issueRequest(ipcRenderer);
}

$(() => {
    $("#applyAllBtn").click(worldSettingsChanged);
    app = visualizer.app;
    new Commands.SettingsCommand().issueRequest(ipcRenderer);
    requestCarUpdate();
});

module.exports.setDefaults = setDefaults;
module.exports.requestCarUpdate = requestCarUpdate;
module.exports.populateCars = populateCars;