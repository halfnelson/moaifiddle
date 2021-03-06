 module.exports = {
     install: function(ractive) {
         ractive.components['splitter'] = ractive.extend(require('./splitter.ract'));
         ractive.components['splitter-handle'] = ractive.extend(require('./splitter-handle.ract'));
         ractive.components['splitter-panel'] = ractive.extend(require('./splitter-panel.ract'));

         ractive.components['modal'] = ractive.extend(require('./modal.ract'));
         ractive.components['navbutton'] = ractive.extend(require('./nav-button.ract'));
         ractive.components['navdropdown'] = ractive.extend(require('./nav-dropdown.ract'));
     }
 };