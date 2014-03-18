/// <reference path="approot.ts" />
/// <reference path="services/services.ts" />

App.Router.map(function() {
    // put your routes here
});

App['IndexRoute'] = Ember.Route.extend({

    model: function() {
        return ['red', 'yellow', 'blue','green2'];
    }
});

App.inject('controller:index','testService','testService:main');
App['IndexController'] = Ember.ArrayController.extend({
   testy: function() {
       this.testService.dotest();
   }.property()
});
