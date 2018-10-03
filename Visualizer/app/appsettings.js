const fs = require('fs');
class AppSettings {
    constructor() {} //Do nothing in our constructor

    loadFromFile(fileName) {
        var fileBufer = fs.readFileSync(fileName);
        this.settingsJSON = JSON.parse(
            fileBufer
        );

        this.pythonPath = this.settingsJSON["PYTHON_PATH"];
    }
}

module.exports = (() => {
    var instance = null;
    return {
        getInstance: () => {
            if(instance == null) {
                instance = new AppSettings();
                instance.constructor = null;
            }
            return instance;
        }
    }
});