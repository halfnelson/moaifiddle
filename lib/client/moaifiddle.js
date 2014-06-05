require('../components/components.js');
var editorTemplate = require('./moaifiddle.ract').template;

window.moaifiddle = new Ractive({
    el: 'editorContainer',
    template: editorTemplate,

    data: {
        slug: null,
        revision: 1,
        filelist: {
            visible: true,
            width: 209
        }
    },
    complete: function() {
        //hook our components
        this.editor = this.findComponent('editor');
        this.fileBrowser = this.findComponent("filebrowser");

        this.console = $('#player-console').terminal(function(command, term) {
            this.fire('terminal-input',command,term);
        }.bind(this),
            {
                greetings: 'MoaiJS Player v1.01',
                name: 'fiddle_console',
                prompt: 'lua> '});

        this.console.disable(); //it grabs focus
        this.editor.focus();


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
    form.append($("<input/>").attr({type: "hidden", name:"fiddle",value:this.editor.getText()}));
    $("body").append(form);
    form.submit();
    form.remove();
});

moaifiddle.setFiddleText = function(fiddletext) {
    this.editor.setText(fiddletext);
};

moaifiddle.on("resize",function() {
   this.editor.resize();
});

moaifiddle.on("save", function() {
    var fiddle = this.editor.getText();
    var slug = this.get('slug');
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