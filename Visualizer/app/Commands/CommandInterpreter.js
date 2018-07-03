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
            switch(msg.type) {
                case NetMsg.Type.TYPE_COMMAND: {
                    self.onCommand(msg.body);
                    break;
                }
                default: break;
            }
        }
    }

    onCommand(commandName) {
        var command = this.commands[commandName];
        if(command) {
            command.execute(this.pipe);
        }
    }

}

module.exports = CommandInterpreter;