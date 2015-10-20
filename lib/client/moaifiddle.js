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


moaifiddle.on("addFileToPackage", function(finfo) {
    console.log("got file",finfo);
    var files = this.get("files");
    files.push({
        filename: finfo.dir + (finfo.dir == "/" ? "": "/")+finfo.filename,
        data: new Uint8Array(finfo.data)
    });
    this.dirty = true;
});

moaifiddle.on("terminal-input",
    function(command, term) {
        window.frames['result'].sendCommand(command);
    }
);

moaifiddle.on("play", function(event) {
    this.rebuildRom();
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
            this.romData = packageData;

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

moaifiddle.rebuildRom = function() {
    if (!this.dirty) return;

    var data = this.buildRomData();
    this.romData = data.romData;
    this.romJson = data.romJson;
};


moaifiddle.buildRomData = function() {

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    //loop over this.files and construct a new arraybuffer
    var files = this.get('files');
    var newFiles = [];
    var newDirs = [];
    var size = _.reduce(files, function (sizeSoFar, file) {
        return sizeSoFar + file.data.length;
    }, 0);
    var newBuff = new Uint8Array(size);
    var offset = 0;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var newFile = {
            audio: "0",
            crunched: "0",
            filename: file.filename,
            start: offset,
            end: offset + file.data.length
        };
        newFiles.push(newFile);
        //collect directories as we go
        var dir = file.filename.split("/").slice(1).slice(0, -1).join("/");
        if (newDirs.indexOf(dir) == -1) {
            newDirs.push(dir);
        }
        //copy in our data
        newBuff.set(file.data, offset);
        offset = newFile.end;
    }

    var romJson = {
        files: newFiles,
        package_uuid: guid(),
        bundle_file: "moaiapp.rom",
        directories: newDirs
    };

    return {
        romJson: romJson,
        romData: newBuff.buffer
    }
}


moaifiddle.loadFilesFromJSON = function(json_url, callback) {
    $.get(json_url).done(function(data) {
        this.romJson = data;
        this.set('files',data.files.slice());
        if (callback) callback();
    }.bind(this))
};

moaifiddle.on("resize",function() {
   this.editor.resize();
});


moaifiddle.on("save", function() {
    this.rebuildRom();
    var fiddle = this.editor.getText();
    var slug = this.get('slug');

    var payload = {
        fiddle: fiddle,
        json: JSON.stringify(this.romJson),
        rom: b64.base64EncArr(new Uint8Array(this.romData))
    };
    $.post('/'+slug,payload)
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