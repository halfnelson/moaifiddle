module.exports = {
    install: function(ractive) {
        ractive.components['sharedialog'] = ractive.extend(require('./sharedialog.ract'));
        ractive.components['filebrowser'] = ractive.extend(require('./filebrowser.ract'));
        ractive.components['filepreview'] = ractive.extend(require('./filepreview.ract'));
        ractive.components['editor'] = ractive.extend(require('./editor.ract'));
    }
};