const TYPES = {
    TYPE_COMMAND: 0,
    TYPE_MESSAGE: 1,
    TYPE_COMMAND_RESPONSE: 1
};

class NetMsg {
    constructor(type) {
        this.type = type;
    }

    serialize(body) {
        return JSON.stringify(
            {
                type: this.type,
                body: body
            }
        );
    }

    static get Type() {
        return TYPES;
    }

    static get Verify() {
        class NetMessageVerification {
            constructor(message) {
                this.message = message;
            }

            isMessage() {
                try {
                    this.messageObj = JSON.parse(this.message);
                    if(this.messageObj.type == undefined) return false; //Verify the message header
                    if(this.messageObj.body == undefined) return false; //Verify the message body
                } catch (e) {
                    return false;
                }
                return true;
            }
        }
        return NetMessageVerification;
    }
}

module.exports = NetMsg;