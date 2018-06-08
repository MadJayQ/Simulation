class CommandInterpreter {
    constructor(ipcPipe) {
        this.pipe = ipcPipe; //This is our named pipe through which our processes will communicate
        this.pipe.on('asynchronous-message', this.onAsyncMessageReceived);
        this.commands = {};
    }
        
    registerCommand(command) {
        this.commands[command.request] = command;
    }

    onAsyncMessageReceived(event, arg) {
        event.sender.send('asynchronouse-reply', 'Hello');
    }

    onCommand(commandName) {
        var command = this.commands[commandName];
        if(command) {
            command.execute(this.pipe);
        }
    }

}

module.exports = CommandInterpreter;