/// <reference path="../approot.ts" />
App['testService'] = Ember.Object.extend({
    hello: "hello world",
    dotest: function() { console.log(this.get('hello')); }
});

Ember.Application.initializer({
    name: 'register services',
    initialize: function(container, application)  {
        application.register('testService:main', App['testService']);
    }
});
