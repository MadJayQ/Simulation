class WorldCommand extends Command {
    constructor(simulationWorld) {
        this.simulationWorld
        super("request-world", this.onExecute);
    }

    onExecute(ipc) {

    }
}