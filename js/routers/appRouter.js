define(function (require) {
  'use strict';
  
  var Backbone          = require('backbone')
    , ViewTheWorld      = require('viewTheWorld')
    , TourView          = require('views/tour')
    , LoginView         = require('views/login')
    , SfcallbackView    = require('views/sfcallback')
    , LoginModel        = require('models/login')
    , LoginInfoModel    = require('models/loginInfo')
    , VideoView         = require('views/video');

  function getJsonFromUrl(query) {

    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  ViewTheWorld.Router.AppRouter = Backbone.Router.extend({

    initialize: function() {
      Backbone.history.start();
    },
    
    routes: {
      'login': 'login',
      'tour': 'tour',
      '': 'tour',
      'video': 'video',
      'sfcallback/#:query': 'sfcallback'
    },
    
    sfcallback: function(query) {

      var params = getJsonFromUrl(query);

      new SfcallbackView({
        el: "#container",
        params: params,
        model: new LoginModel({loginInfoModel: this.getLoginInfoModel()})
      });
    },
    
    video: function() {
      var loginInfo = this.getLoginInfoModel();
      if(loginInfo.isLoggedIn("loopMode")){
        this.videoView = new VideoView({
          el: "#container",
          loginInfoModel: loginInfo
        });
        this.videoView.render();
      } else {
        Backbone.history.navigate('login', true);
      }
    },
    
    login: function() {
      if(this.loginView) {
        this.loginView.stopListening();
        this.loginView.undelegateEvents();
      }
      
      this.loginView = new LoginView({
        el: "#container",
        model: new LoginModel({loginInfoModel: this.getLoginInfoModel()}),
        loginInfoModel: this.getLoginInfoModel()
      });
      this.getLoginInfoModel().set('isLoggedIn', false);
    },
    
    tour: function() {
      var loginInfo = this.getLoginInfoModel();
      if(loginInfo.isLoggedIn()){
        new TourView({
          el: "#container",
          loginInfoModel: loginInfo
        });
      } else {
        Backbone.history.navigate('login', true);
      }
    },

    getLoginInfoModel: function(){
      this.loginInfo = this.loginInfo || new LoginInfoModel();
      return this.loginInfo;
    }

  });
  
  return ViewTheWorld.Router.AppRouter;
});
