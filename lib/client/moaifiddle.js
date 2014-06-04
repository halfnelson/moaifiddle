require('../components/components.js');
var editorTemplate = require('./moaifiddle.ract').template;

window.moaifiddle = new Ractive({
    el: 'editorContainer',
    template: editorTemplate,
    twoway:false,
    data: {
        filelist: {
            visible: true,
            width: 209
        },
        currentDropdown: "None"
    },
    complete: function() {
        //bind some vars
       // this.slug = $('#runForm').find('input[name="slug"]').val();
       // this.set("slug",this.slug);

       // $('#editor').text(fiddle);

        var editor = ace.edit("editor");

        editor.setTheme("ace/theme/monokai");
        var session = editor.getSession();

        editor.setShowPrintMargin(false);
        session.setMode("ace/mode/lua");
        session.setUseWrapMode(true);
        this.editor = editor;

        this.console = $('#player-console').terminal(function(command, term) {
            this.fire('terminal-input',command,term);
        }.bind(this),
            {
                greetings: 'MoaiJS Player v1.01',
                name: 'fiddle_console',
                prompt: 'lua> '});

        this.console.disable(); //it grabs focus
        this.editor.focus();

        this.fileBrowser = this.findComponent("filebrowser");
        this.fire('ready');
    }
});
moaifiddle.on("terminal-input",
    function(command, term) {
        window.frames['result'].sendCommand(command);

    }
);

moaifiddle.on("play", function(event) {
    //we want to target our iframe so build a form here:
    var form=$("<form/>").attr({
        method: "post",
        action: "/run",
        target: "result"
    });
    form.append($("<input/>").attr({type: "hidden", name:"slug",value:this.get('slug')}));
    form.append($("<input/>").attr({type: "hidden", name:"revision",value:this.get('revision')}));
    form.append($("<input/>").attr({type: "hidden", name:"fiddle",value:this.editor.getSession().getValue()}));
    $("body").append(form);
    form.submit();
    form.remove();
});

moaifiddle.setFiddleText = function(fiddletext) {
    this.editor.getSession().setValue(fiddletext);
}

moaifiddle.on("save", function() {
    var fiddle = this.editor.getSession().getValue();
    var slug = this.slug;
    $.post('/'+slug,{fiddle:fiddle})
        .done(function(data) {
            var newLoc = "/";
            if (data.slug) {
                newLoc = newLoc + encodeURIComponent(data.slug);

                if (data.revision) {
                    newLoc = newLoc + "/" + encodeURIComponent(data.revision);
                }
            }
            window.location.pathname = newLoc;
        });
});