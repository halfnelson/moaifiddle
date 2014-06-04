module.exports = {
    install: function(ractive) {
        ractive.components['sharedialog'] = ractive.extend(require('./sharedialog.ract'));
        ractive.components['filebrowser'] = ractive.extend(require('./filebrowser.ract'));
    }
};