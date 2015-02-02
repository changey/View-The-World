define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , FaqcardQuestionModel = require('models/faqcardQuestion');
  
  ViewTheWorld.Collections.FaqcardQuestions = Backbone.Collection.extend({
    model: FaqcardQuestionModel
  });
  
  return ViewTheWorld.Colections.FaqcardQuestions;
});