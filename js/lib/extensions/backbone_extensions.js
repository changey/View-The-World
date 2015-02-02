require(['backbone'], function(Backbone){
  'use strict';
  
  Backbone.View.prototype.assign = function (view, selector) {
    return view.setElement(this.$(selector)).render();
  };
});