define(function() {
  'use strict';
  
  var Redirector = function(){ 
    this.redirectTo = function(url){
      window.location.href = url;
    };
  };
  
  return Redirector;
});