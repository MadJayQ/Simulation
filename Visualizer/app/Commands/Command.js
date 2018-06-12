var NetMsg = require('./NetMsg.js');

class Command {
    constructor(requestName, responseCb) {
        this.request = requestName;
        this.responseCb = responseCb;
    }

    issueRequest(ipc) {
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND);
        ipc.send(
            "asynchronous-message",
            netMsg.serialize(this.request)
        );
    }

    execute(pipe) {
        this.responseCb(pipe);
    }
}


class GridCommand extends Command {
    constructor(world) {
        super("query-grid", () => {this.execute});
        this.world = world;
    }

    execute(pipe) {
        var serialziedWorld = this.world.serialize();
        var netMsg = new NetMsg(NetMsg.Type.TYPE_COMMAND_RESPONSE);
        pipe.sender.send("asynchronous-reply", netMsg.serialize(
            {
                type: "grid-request",
                body: serialziedWorld
            }
        ));
    }
}

//module.exports.Command = Command;
module.exports.GridCommand = GridCommand;