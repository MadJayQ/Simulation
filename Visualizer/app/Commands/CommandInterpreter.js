var NetMsg = require('./NetMsg.js');

class CommandInterpreter {
    constructor(ipcPipe) {
        this.pipe = ipcPipe; //This is our named pipe through which our processes will communicate
        this.pipe.on('asynchronous-message', (event, arg) => {
            var self = this;
            self.onAsyncMessageReceived(self, event, arg);
        });
        this.commands = {};
    }
        
    registerCommands(commands) {
        for(var i = 0; i < commands.length; i++) {
            var command = commands[i];
            this.commands[command.request] = command;
        }
    }

    onAsyncMessageReceived(self, event, arg) {
        var possibleCommand = new NetMsg.Verify(arg);
        self.pipe.sender = event.sender;
        if(possibleCommand.isMessage()) {
            var msg = possibleCommand.messageObj;
            var bodyData = msg.body.split(";");
            switch(msg.type) {
                case NetMsg.Type.TYPE_COMMAND: {
                    self.onCommand(bodyData[0], true, bodyData[1]);
                    break;
                }
                default: break;
            }
        }
    }

    onCommand(commandName, usePipe, payload) {
        var command = this.commands[commandName];
        if(payload !== undefined) {
            command.payload = payload;
        } else {
            command.payload = undefined;
        }
        if(command) {
            command.execute((usePipe) ? this.pipe : undefined);
        }
        return command;
    }

}

module.exports = CommandInterpreter;