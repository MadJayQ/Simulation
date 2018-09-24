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

var waitingOnSimulation = false;
var remainingIterations = 0;
var lastSettings = {};

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

function getSettings() {
    var worldWidth = Number($("#width-input").val());
    var worldHeight = Number($("#height-input").val());
    var minCars = Number($("#min-cars-input").val());
    var maxCars = Number($("#max-cars-input").val());
    var minCapacity = Number($("#min-capacity-input").val());
    var maxCapacity = Number($("#max-capacity-input").val());
    var minCost = Number($("#min-cost-input").val());
    var maxCost = Number($("#max-cost-input").val());
    var minReward = Number($("#min-reward-input").val());
    var maxReward = Number($("#max-reward-input").val());
    var seed = $("#randomizer-seed-input").val();
    var machineEpislon = Number($("#mach-eps-input").val());

    var settings = require('../app/Settings/Settings.js');
    settings.worldSettings.tileWidth = worldWidth;
    settings.worldSettings.tileHeight = worldHeight;
    settings.worldSettings.minCars = minCars;
    settings.worldSettings.maxCars = maxCars;
    settings.worldSettings.minCapacity = minCapacity;
    settings.worldSettings.maxCapacity = maxCapacity;
    settings.worldSettings.minReward = minReward;
    settings.worldSettings.maxReward = maxReward;
    settings.worldSettings.minCost = minCost;
    settings.worldSettings.maxCost = maxCost;
    settings.miscSettings.seed = seed;
    settings.miscSettings.machEps = machineEpislon;

    return settings;
}

function worldSettingsChanged(e) {
    var settings = getSettings();
    var SettingsCommand = new Commands.SettingsCommand(undefined, JSON.stringify(settings));
    SettingsCommand.issueRequest(ipcRenderer);
}

function createCarTab(num, startPos, endPos, capacity) {
    var tabHtml = (' ' + tabTemplate).slice(1);
    tabHtml = tabHtml.split("%CARNUM%").join(num);
    var panel = $(tabHtml);
    
    panel.mouseenter(() => {
        visualizer.app.onCarHover(panel);
    });
    panel.mouseleave(() => {
        visualizer.app.onCarHoverLeave(panel);
    })
    
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
    $("#min-reward-input").val(defaultSettings.worldSettings.minReward);
    $("#max-reward-input").val(defaultSettings.worldSettings.maxReward);
    $("#randomizer-seed-input").val(defaultSettings.miscSettings.seed);
    $("#mach-eps-input").val(defaultSettings.miscSettings.machEps);

    $("#capacity-input-start").val(1.0);
    $("#capacity-input-deviance").val(0.0);
    $("#cost-input-start").val(0.1);
    $("#cost-input-deviance").val(0.0);
}

function requestCarUpdate() {
    new Commands.CarsCommand().issueRequest(ipcRenderer);

}

function requestNextSimulation() {
    if(!waitingOnSimulation) {
        return;
    }
    if(remainingIterations <= 0) {
        waitingOnSimulation = false;
        remainingIterations = 0;
        return;
    }

    var capacityDeviance = Number($("#capacity-input-deviance").val());
    var costDeviance = Number($("#cost-input-deviance").val());

    new Commands.SettingsCommand(undefined, JSON.stringify(lastSettings)).issueRequest(ipcRenderer);
    new Commands.RandomizeWorldCommand(undefined).issueRequest(ipcRenderer);
    new Commands.SimulationBakeCommand().issueRequest(ipcRenderer);

    lastSettings.worldSettings.minCapacity = lastSettings.worldSettings.minCapacity + capacityDeviance;
    lastSettings.worldSettings.maxCapacity = lastSettings.worldSettings.maxCapacity + capacityDeviance;
    lastSettings.worldSettings.minCost = lastSettings.worldSettings.minCost + costDeviance;
    lastSettings.worldSettings.maxCost = lastSettings.worldSettings.maxCost + costDeviance;

    remainingIterations = remainingIterations - 1;

}

function generateReport() {
    var settings = getSettings();
    var numItr = 10;
    var capacityStart = Number($("#capacity-input-start").val());

    var costStart = Number($("#cost-input-start").val());


    settings.worldSettings.minCapacity = capacityStart;
    settings.worldSettings.maxCapacity = capacityStart;
    settings.worldSettings.minCost = costStart;
    settings.worldSettings.maxCost = costStart;

    remainingIterations = numItr;
    waitingOnSimulation = true;
    lastSettings = settings;

    requestNextSimulation();
}

function requestTimeSensing(e) {
    new Commands.MaximumTimeSensingCommand().issueRequest(ipcRenderer);
}

$(() => {
    $("#applyAllBtn").click(worldSettingsChanged);
    $("#reportBtn").click(generateReport);
    $("#timeSensingBtn").click(requestTimeSensing);
    app = visualizer.app;
    new Commands.SettingsCommand().issueRequest(ipcRenderer);
    requestCarUpdate();
});

module.exports.setDefaults = setDefaults;
module.exports.requestCarUpdate = requestCarUpdate;
module.exports.requestNextSimulation = requestNextSimulation;
module.exports.populateCars = populateCars;