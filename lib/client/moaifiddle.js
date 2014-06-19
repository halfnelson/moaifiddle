require('../components/components.js');
var editorTemplate = require('./moaifiddle.ract').template;

window.moaifiddle = new Ractive({
    el: 'editorContainer',
    template: editorTemplate,
    debug: true,
    data: {
        slug: null,
        revision: 1,
        files: [],
        filelist: {
            visible: true,
            width: 209
        }
    },

    computed: {
      fileBrowserFiles: function() {
          return _(this.get('files')).map(function(f) { return { name: f.filename }});
      },

      highlights: function() {
          var previewing = this.get('previewing');
          if (previewing) {
              var ret = {};
              ret[previewing.filename] = 'orange';
              return ret;
          } else
          {
              return {};
          }
      }
    },


    complete: function() {
        //hook our components
        this.editor = this.findComponent('editor');
        this.fileBrowser = this.findComponent("filebrowser");
        this.filePreview = this.findComponent("filepreview");
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

moaifiddle.on("previewFile", function (filename) {
    console.log("open in moaifiddle",filename);
    //show preview dialog
    //set preview file to the file article at path in files array
    var files = this.get('files');
    var file = _(files).find(function(f) {return f.filename == filename });

    this.filePreview.showFile(file);

    this.set('previewing', file);


});

moaifiddle.on("closePreview", function() {
    this.set('previewing',null);
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

moaifiddle.loadFileSystem = function(rom_url) {
    this.loadFilesFromJSON(rom_url+'.json',function() {
        //TODO Caching?
        var xhr = new XMLHttpRequest();
        xhr.open('GET', rom_url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(event) {
            var packageData = xhr.response;
            //attach a pointer to each loaded file
            var files = this.get('files');
            for (var i=0; i < files.length; i++) {
                var file = files[i];
                file.data = new Uint8Array(packageData,file.start,(file.end -file.start));
            }
            this.set('files',files)
        }.bind(this);
        xhr.send(null)
    }.bind(this))
};

moaifiddle.loadFilesFromJSON = function(json_url, callback) {
    $.get(json_url).done(function(data) {
        this.set('files',data.files);
        if (callback) callback();
    }.bind(this))
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