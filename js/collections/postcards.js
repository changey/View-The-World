define(function(require) {
  'use strict';

  var Backbone = require('backbone')
    , _ = require('underscore')
    , ViewTheWorld = require('viewTheWorld')
    , PostcardModel = require('models/postcard');

  ViewTheWorld.Collections.Postcards = Backbone.Collection.extend({
    model: PostcardModel,

    initialize: function(models, options) {
      this.activeLocation = options.activeLocation;
      this.listenTo(this.activeLocation, 'change', this.onLocationChange);
      
      this.fetchPhotos(models);
    },
 
    onLocationChange: function(){
      this.fetchPhotos(this.models);  
    },
    
    fetchPhotos: function(models) {
      models.splice(0);
      
      _.each(this.activeLocation.get('location').getPhotoSphereIds(), _.bind(function(photoSphereId) {
        var postcard = new PostcardModel({
          thumbnail: "http://maps.googleapis.com/maps/api/streetview?" +
            "size=163x97" +
            "&pano=" + photoSphereId +
            "&fov=90&heading=235&pitch=10&sensor=false" +
            "&key=AIzaSyBBPvjUmwkS_q9dymLOuZm_zHQmAyXYunc",
          photoSphereId: photoSphereId
        });
        
        models.push(postcard);
      }, this));
      
      this.trigger('change');
    }
  });

  return ViewTheWorld.Collections.Postcards;
});