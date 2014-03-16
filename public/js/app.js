var App = Ember.Application.create();

App.Router.map(function () {
});

App['IndexRoute'] = Ember.Route.extend({
    model: function () {
        return ['red', 'yellow', 'blue', 'green2'];
    }
});
//# sourceMappingURL=app.js.map
