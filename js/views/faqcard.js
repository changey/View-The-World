define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , _ = require('underscore')
    , ViewTheWorld = require('viewTheWorld')
    , FaqcardTemplate = require('text!../../templates/faqcard.tmpl')
    , ModelSelection = require('models/modelSelection')
    , FaqcardQuestionsView = require('views/faqcardQuestions')
    , FaqcardQuestionModel = require('models/faqcardQuestion');
  
  ViewTheWorld.Views.Faqcard = Backbone.View.extend({
    
    FAQCARD_LEFT: 475,
    
    FAQCARD_WIDTH: 186,
    
    events: {
      'click .faqcard': 'selectFaqcard'
    },
    
    initialize: function(options) {
      this.modelSelection = options.modelSelection || new ModelSelection();
      this.listenTo(this.modelSelection, 'change', this.render, this);
      this.faqcards = options.faqcards;
      this.faqcardsView = options.faqcardsView;
    },
    
    render: function() {
      
      if (this.model) {
        this.model.set('isSelected', this.modelSelection.isSelected(this.model));
      } else {
        this.model = new FaqcardQuestionModel();
      }

      var template = _.template(FaqcardTemplate, {
        faqcard: this.model,
        isSelected: this.model.get('isSelected')
      });
      this.$el.html(template);
      
      return this;
    },
    
    selectFaqcard: function(e) {
      this.modelSelection.select(this.model);

      var faqcardQuestionModels = [];
      var faqcardQuestionModel;

      _.each(this.model.get('questions'), function(question) {
        faqcardQuestionModel = new FaqcardQuestionModel(question);
        faqcardQuestionModels.push(faqcardQuestionModel);
      });
      
      this.faqcardQuestionsView = new FaqcardQuestionsView({
        el: '#faqcard-questions-container',
        questions: faqcardQuestionModels,
        faqcardsView: this.faqcardsView
      });
      this.faqcardQuestionsView.render();
      
      var selectedFaqcardName = $(e.currentTarget).data("name");
      if (selectedFaqcardName) {
        var faqcardIndex = this.faqcards.indexOf(_.where(this.faqcards, {name: selectedFaqcardName})[0]);
        
        this.faqcardQuestionsView.$el[0].style.left = String(this.FAQCARD_LEFT +
          faqcardIndex * this.FAQCARD_WIDTH) + "px";

      }
      
    }
  });
  
  return ViewTheWorld.Views.Faqcard;
});