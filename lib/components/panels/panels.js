module.exports = {
    install: function(ractive) {
      //todo share.ejs, filebrowser
        ractive.components['sharedialog'] = ractive.extend(require('./sharedialog.ract'));
    }
};