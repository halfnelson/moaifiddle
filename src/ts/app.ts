/// <reference path="typedefs/ember/ember.d.ts" />

var App =  Ember.Application.create<Ember.Application>();

App.Router.map(function() {
    // put your routes here
});

App['IndexRoute'] = Ember.Route.extend({
    model: function() {
        return ['red', 'yellow', 'blue','green'];
    }
});
