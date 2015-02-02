define(function(require) {
  'use strict';

  var $ = require('jquery')
    , _ = require('underscore')
    , Backbone = require('backbone')
    , PostcardView = require('views/postcard')
    , PostcardsTemplate = require('text!../../templates/postcards.tmpl')
    , ViewTheWorld = require('viewTheWorld')
    , ModelSelection = require('models/modelSelection')
    , PhotoSphereView = require('views/photoSphere');

  ViewTheWorld.Views.Postcards = Backbone.View.extend({
    initialize: function(options) {
      this.isShown = options.isShown;
      this.activeLocation = options.activeLocation;
      this.locations = options.locations;
      this.modelSelection = options.modelSelection || new ModelSelection();
      this.photoSphereView = new PhotoSphereView({
        postcardSelection: this.modelSelection,
        el: '#photo-sphere'
      });

      this.listenTo(this.modelSelection, 'change', this.render, this);
    },

    hide: function() {
      this.$el.html('');
      this.isShown = false;
      this.collection.off("change add", this.render, this);
    },

    show: function() {
      this.collection.on("change add", this.render, this);
      this.render();
    },

    render: function() {
      var template = _.template(PostcardsTemplate, { postcardCount: this.collection.size() });
      this.$el.html(template);
      _.each(this.$el.find('.postcard-container'), _.bind(function(postcardContainerDiv, index) {
        this.assign(new PostcardView({
          model: this.collection.models[index],
          modelSelection: this.modelSelection
        }), postcardContainerDiv);
      }, this));

      this.animatePostcardAppearance();

      this.assign(this.photoSphereView, $('#photo-sphere'));
      return this;
    },

    animatePostcardAppearance: function() {
      var $postcards = this.$el.find('#postcards-inner-wrapper');
      var $activeLocation = $('.location.active');
      if ($activeLocation[0]) {
        var activeLocationPosition = $activeLocation.offset();
        if (!this.isShown) {
          $postcards[0].style.left = activeLocationPosition.left + "px";
          $postcards.addClass('expand-height', 100);
          setTimeout(_.bind(function() {
            this.expandSize(activeLocationPosition, $postcards);
            this.isShown = true;
          }, this), 200);
        } else {
          this.expandSize(activeLocationPosition, $postcards);
        }
      }
    },
    
    expandSize: function(activeLocationPosition, postcards) {
      postcards.addClass('expand-height');
      var postcardWidth = 192;
      var postcardSetWidth = postcardWidth * this.collection.size();
      var normalLeft = activeLocationPosition.left - (postcardSetWidth - postcardWidth) / 2;
      var maxLeft = $('#postcards-container').width() - postcardSetWidth;
      postcards[0].style.left = Math.min(Math.max(0, normalLeft), maxLeft) + "px";
      postcards.addClass('expand-width');
    }
  });

  return ViewTheWorld.Views.Postcards;
});