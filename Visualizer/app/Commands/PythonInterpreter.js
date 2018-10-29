const PythonShell = require('python-shell');
const fs = require('fs');
const AppSettings = require('../appsettings.js');
var finishCallback = undefined;
class PythonInterpreter {
    constructor(executor) {
        this.executor = executor;
        this.simulating = false;
    }

    notifyOnFinish(callback, caller) {
        finishCallback = callback;
        finishCallback = finishCallback.bind(caller);
    }
    
    startModule(world) {
        var serializedWorld = world.serialize();
        fs.writeFileSync('./data.json', serializedWorld);
        var pythonPath = "F:\\Programming\\Languages\\Emscripten\\python\\2.7.5.3_64bit\\python";//AppSettings().getInstance().pythonPath;
        this.shell = new PythonShell(
            this.executor, {
                pythonOptions: ['-B'], 
                mode: 'text',
                pythonPath: pythonPath,
                args: [world.width, world.height]
            }
        );
        this.shell.stdout.on(
           'data', 
           this.onDataReceived
        );
    }

    runModule(command) {
        if(this.shell) {
            this.shell.send(command);
        }
    }

    onDataReceived(data) {
        var doneIdx = data.indexOf("done");
        if(doneIdx != -1) {
            finishCallback(data.slice(doneIdx + 5));
        } else {
            console.log(data);
        }

    }
}

module.exports = PythonInterpreter;