var App = Ember.Application.create();

App.Router.map(function () {
});

App['IndexRoute'] = Ember.Route.extend({
    model: function () {
        return ['red', 'yellow', 'blue', 'green'];
    }
});
//# sourceMappingURL=app.js.map
