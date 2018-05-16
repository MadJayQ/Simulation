const fs = require('fs');
const {ipcRenderer} = require('electron');

$(() => {
    function test() {

    }
    function cleanFilename(filename) {
        var name = filename.split(".")[0];
        return name;
    }
    fs.readdir("scripts/", (err, files) => {
        files.forEach((file, idx) => {
            if(file !== "exec.py") {
                var item = document.createElement("li");
                var link = document.createElement("a");
                var icon = document.createElement("i");
                var name = file.split(".")[0].replace();
                name = name.charAt(0).toUpperCase() + name.slice(1);
                icon.className = "fa fa-cogs fa-fw";
                link.href = "editor.html?&file=" + file;
                link.appendChild(icon);
                link.innerHTML += " " + name;
                item.appendChild(link);
                $("#module-list").get(0).appendChild(item);
                //createEntry(item, file);
            }
        });
    })
});