define(function(require) {
  'use strict';

  require('googleMapsLoader');
  var Backbone = require('backbone')
    , _ = require('underscore')
    , ViewTheWorld = require('viewTheWorld')
    , FaqcardContentTemplate = require('text!../../templates/faqcardContent.tmpl');

  ViewTheWorld.Views.FaqcardContent = Backbone.View.extend({
    events: {
      'click #done-button': 'done',
      'click #next-button': 'next',
      'click #previous-button': 'previous'
    },
    
    initialize: function(options) {
      this.url = options.url;
      this.faqcardsView = options.faqcardsView;
      this.questions = options.questions || [];
    },
    
    render: function() {
      var template = _.template(FaqcardContentTemplate, {
        url: this.url
      });
      this.$el.html(template);
      this.currentQuestionIndex = this.questions.indexOf(_.where(this.questions, {url: this.url})[0]);
      if (this.currentQuestionIndex === 0) {
        this.$el.find('#previous-button').addClass('not-visible');
      }
      if (this.currentQuestionIndex === _.size(this.questions) - 1) {
        this.$el.find('#next-button').addClass('not-visible');
      }

      return this;
    },
    
    done: function() {
      this.$el.addClass('hidden');
      this.faqcardsView.$el.find('#faqcard-questions-container').show();
    },
    
    next: function() {
      
      var nextQuestionIndex = this.currentQuestionIndex + 1;
      if (nextQuestionIndex <= _.size(this.questions) - 1) {
        this.url = this.questions[nextQuestionIndex].url;
        this.render();
      }
    },

    previous: function() {

      var previousQuestionIndex = this.currentQuestionIndex - 1;
      if (previousQuestionIndex >= 0) {
        this.url = this.questions[previousQuestionIndex].url;
        this.render();
      }
    }
  });
  
  return ViewTheWorld.Views.FaqcardContent;
});