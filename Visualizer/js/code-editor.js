const fs = require("fs");
const CodeMirror = require('codemirror');
const {ipcRenderer} = require('electron');

$(() => {
    var GET = {};
    var query = window.location.search.substring(1).split("&")
    console.log(query);
    for (var i = 0, max = query.length; i < max; i++)
    {
        if (query[i] === "") // check for trailing & with no param
            continue;
        var param = query[i].split("=");
        GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
    }
    window.editFile = GET["file"];
    var editor = $("#editor").get(0);
    var texteditor = document.createElement("textarea");
    texteditor.id = "text-editor";
    texteditor.className = "code-editor";
    editor.appendChild(texteditor);
    var module = fs.readFileSync("model/" + GET["file"]);
    texteditor.value = module.toString();
    require("codemirror/mode/python/python");
    require("codemirror/addon/edit/closebrackets");

    var codeEditor = CodeMirror.fromTextArea(document.getElementById("text-editor", {
        mode: "python",
        theme: "midnight"
    }));

    console.log(codeEditor.save());

    var header = $("#edit-header").get(0);
    header.innerText += " | " + GET["file"];

    $("#save-button").click(() => {
        var path = "model/" + window.editFile;
        codeEditor.save();
        fs.writeFile(
            path, 
            $("#text-editor").val(),
            (error) => {
                if(error) throw error;
                console.log("File saved!");
                ipcRenderer.sendSync("synchronous-message", "restart-pyshell");
            }
        );
    });
});