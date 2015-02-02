define(function(require) {
  'use strict';

  var _ = require('underscore')
    , Backbone = require('backbone')
    , ViewTheWorld = require('viewTheWorld')
    , FaqcardView = require('views/faqcard')
    , FaqcardsTemplate = require('text!../../templates/faqcards.tmpl')
    , ModelSelection = require('models/modelSelection');
  
  ViewTheWorld.Views.Faqcards = Backbone.View.extend({
    
    FAQCARD_SIZE: 5,
    
    initialize: function() {
      this.modelSelection = new ModelSelection();
      this.listenTo(this.modelSelection, 'change', this.render, this);
    },
    
    render: function() {

      var template = _.template(FaqcardsTemplate, { 
        faqcardCount: this.FAQCARD_SIZE,
        hasFaqcardSelected: false
      });
      this.$el.html(template);
      
      var faqcards = [];
      _.each(this.collection.models, function(faqcard) {
        faqcards.push(faqcard.attributes);
      });

      _.each(this.$el.find('.faqcard-container'), _.bind(function(faqcardContainerDiv, index) {
        this.assign(new FaqcardView({
          model: this.collection.models[index],
          modelSelection: this.modelSelection,
          faqcards: faqcards,
          faqcardsView: this
        }), faqcardContainerDiv);
      }, this));

      return this;
    }
  });
  
  return ViewTheWorld.Views.Faqcards;
});