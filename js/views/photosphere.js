define(function(require) {
  'use strict';

  require('googleMapsLoader');
  var Backbone = require('backbone')
    , EventBus = require('eventBus')
    , ViewTheWorld = require('viewTheWorld');

  ViewTheWorld.Views.PhotoSphere = Backbone.View.extend({
    
    initialize: function(options) {
      this.postcardSelection = options.postcardSelection;
    },
    
    render: function(){
      var selected = this.postcardSelection.getModel();
      if(selected && selected.get('photoSphereId')){
        this.showPhotoSphere(selected.get('photoSphereId'));
      }  
    },
    
    showPhotoSphere: function(photoSphereId) {

      $('#postcards-container').addClass('full-height');
      
      var panorama = new google.maps.StreetViewPanorama(this.el,{
        pano: photoSphereId
      });

      google.maps.event.addListener(panorama, 'pov_changed', function() {
        EventBus.trigger('pauseTour');
      });

      this.$el.show();
      setTimeout(function(){
        var zoomControl = $('.gmnoprint[style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; left: 0px; top: 0px;"]');
        zoomControl.hide();
      }, 50);
    },
    
    hide: function(){
      this.$el.hide();
    }
  });
  return ViewTheWorld.Views.PhotoSphere;
});
