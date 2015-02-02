define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , _ = require('underscore')
    , ViewTheWorld = require('viewTheWorld')
    , ModelSelection = require('models/modelSelection')
    , PostcardTemplate = require('text!../../templates/postcard.tmpl')
    , EventBus = require('eventBus');

  ViewTheWorld.Views.Postcard = Backbone.View.extend({
    events: {
      'click .postcard': 'selectPostcard'
    },
    
    initialize: function(options) {
      this.modelSelection = options.modelSelection || new ModelSelection();
      this.listenTo(this.modelSelection, 'change', this.render, this);
    },
    
    render: function() {
      this.model.set('isSelected', this.modelSelection.isSelected(this.model));
      var template = _.template(PostcardTemplate, { postcard: this.model });
      this.$el.html(template);
      
      return this;
    },
    
    selectPostcard: function() {
      EventBus.trigger('pauseTour');
      this.modelSelection.select(this.model);
    }
  });

  return ViewTheWorld.Views.Postcard;
});
