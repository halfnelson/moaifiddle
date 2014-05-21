module.exports = function(Ractive) {
    return {
         Splitter: Ractive.extend(require('./splitter.ract')),
         SplitterHandle: Ractive.extend(require('./splitter-handle.ract')),
         SplitterPanel: Ractive.extend(require('./splitter-panel.ract'))
    }
};

