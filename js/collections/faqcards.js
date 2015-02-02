define(function (require) {
  'use strict';

  var Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , FaqcardModel  = require('models/faqcard');

  ViewTheWorld.Collections.Faqcards = Backbone.Collection.extend({
    model: FaqcardModel,
    url: 'faqcards.json'
  });
  
  return ViewTheWorld.Collections.Faqcards;
});