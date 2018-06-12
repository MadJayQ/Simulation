const PythonShell = require('python-shell');

class PythonInterpreter {
    constructor(executor) {
        this.executor = executor;
    }
    
    startModule(world) {
        var serializedWorld = world.serialize();
        this.shell = new PythonShell(
            this.executor, {
                pythonOptions: ['-B'], 
                mode: 'text',
                pythonPath: 'F:\\Programming\\Languages\\Emscripten\\python\\2.7.5.3_64bit\\python',
                args: [serializedWorld, world.width, world.height]
            }
        );

        this.shell.stdout.on(
           'data', 
           this.onDataReceived
        );
    }

    runModule() {
        if(this.shell) {
            this.shell.send("start");
        }
    }

    onDataReceived(data) {
        console.log(data);
    }
}

module.exports = PythonInterpreter;