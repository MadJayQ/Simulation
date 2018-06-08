class Command {
    constructor(request, responseCb) {
        this.request = requestName;
        this.responseCb = responseCb;
    }

    issueRequest(ipc) {

    }

    execute(pipe) {
        this.responseCb(pipe);
    }
}