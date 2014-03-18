var App = Ember.Application.create();
App['testService'] = Ember.Object.extend({
    hello: "hello world",
    dotest: function () {
        console.log(this.get('hello'));
    }
});

Ember.Application.initializer({
    name: 'register services',
    initialize: function (container, application) {
        application.register('testService:main', App['testService']);
    }
});
App.Router.map(function () {
});

App['IndexRoute'] = Ember.Route.extend({
    model: function () {
        return ['red', 'yellow', 'blue', 'green2'];
    }
});

App.inject('controller:index', 'testService', 'testService:main');
App['IndexController'] = Ember.ArrayController.extend({
    testy: function () {
        this.testService.dotest();
    }.property()
});
//# sourceMappingURL=app.js.map
