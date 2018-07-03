const noUiSlider = require('nouislider');
const wNumb = require('wnumb');
const Commands = require('../app/Commands/Command.js');

class TimescrubberModule {
    constructor(timeSettings, ipcPipe) {
        this.initialized = false;
        this.ipcPipe = ipcPipe;

        if(timeSettings) {
            this.timeSettings = timeSettings;
            this.initialized = true;
        }
    }

    initialize(timeSettings) {
        this.timeSettings = timeSettings;
        this.initialized = true;
    }

    construct() {
        var slider = $("#time-scrubber").get(0);
        var minTime = this.timeSettings.minTime;
        var maxTime = this.timeSettings.maxTime;
        noUiSlider.create(slider, {
            start: [minTime, maxTime],
            connect: true,
            range: {
                'min': minTime,
                'max': maxTime
            },
            tooltips: true,
            format: wNumb({
                decimals: 2,
                prefix: 't='
            })
        });

        var pipe = this.ipcPipe;
        $("#bakeButton").click(() => {
            var cmd = new Commands.SimulationBakeCommand()
            cmd.issueRequest(pipe);
        });
    }
}

module.exports = TimescrubberModule;