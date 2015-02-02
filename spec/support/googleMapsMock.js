define(function() {

  window.google = (function() {
    var mapObj = function(el, options) {
      
      this.initialize = function() {
        this.zoom = 1;
        this.tilt = 45;
      };
      
      this.panTo =  function() {};
      this.setZoom = function(amount) {
        this.zoom = amount;
      };
      this.getZoom = function() {
        return this.zoom;
      };

      this.setHeading = function(amount) {
        this.heading = amount;
      };
      
      this.getHeading = function() {
        return this.heading;
      };
      
      this.getTilt = function() {
        return this.tilt;
      };
      
      this.setTilt = function(tilt) {
        this.tilt = tilt;
      };
      
      this.getCenter = function() {
        return this.latLng;
      };
      
      this.setCenter = function(latLng) {
        this.latLng = latLng;
      };

      this.initialize();
      
      return this;
    };
    
    return {
      maps: {
        Geocoder: function() {},
        Map: mapObj,
        LatLng: function(lat, lng) {
          return {
            lat: function() {
              return lat;
            },
            lng: function() {
              return lng;
            }
          }
        },
        MapTypeId: {
          SATELLITE: 2
        },
        places: {
          Autocomplete: function() {}
        },
        event: {
          addListener: function() {}
        },
        StreetViewPanorama: function() {}
      }
    };
  })();

  return window.google;
});
