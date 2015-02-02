define(function (require) {
  'use strict';
  
  var _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , VideoTemplate     = require('text!../../templates/video.tmpl')
    , VideoHeaderView    = require('views/videoHeader')
    , CustomerModel = require('models/customer')
    , LeadInfoModel = require('models/leadInfo')
    , ContactInfoView = require('views/contactInfo')
    , ActiveStepModel = require('models/activeStep');
  
  ViewTheWorld.Views.Video = Backbone.View.extend({
    
    events: {
      'click #video-form-submit': 'submit',
      'touchmove #video-hiding-hack': 'scroll',
      'touchmove #header': 'scroll'
    },
    
    
    initialize: function(options) {
      this.loginInfoModel = options.loginInfoModel;
      this.customerModel = new CustomerModel();
      this.branchName = this.loginInfoModel.get('branchName');
      this.activeStepModel = new ActiveStepModel({step: 1});

      this.leadInfoModel = new LeadInfoModel({
        customerModel: this.customerModel,
        loginInfoModel: this.loginInfoModel
      });
      
      this.videoHeaderView = new VideoHeaderView({
        el: '#header'
      });

      this.contactInfoView = new ContactInfoView({
        el: "#contact-info-container",
        loginInfoModel: this.loginInfoModel,
        activeStepModel: this.activeStepModel,
        formType: "video"
      });
      
      this.GENERIC_YOUTUBE_ID = "DlFXBkHBT38";
      this.BEST_BUY_YOUTUBE_ID = "lUIkkzTUtug";
    },
    
    render: function() {
      this.loginInfoModel.get('storeName');
      
      var youtubeId = this.loginInfoModel.get('storeName') === "Best Buy" ? this.BEST_BUY_YOUTUBE_ID : this.GENERIC_YOUTUBE_ID;
      
      var template =  _.template(VideoTemplate, {
        youtubeId: youtubeId
      });
      this.$el.find('#contents').html(template);
      this.$el.addClass('video-container');

      var blockContextMenu = function (evt) {
        evt.preventDefault();
      };

      var body = document.querySelector('.video-container');
      body.addEventListener('contextmenu', blockContextMenu);

      this.assign(this.videoHeaderView, "#header");
      this.assign(this.contactInfoView, "#contact-info-container");

      return this;
    },
    
    scroll: function(e) {
      e.preventDefault();
    },

    submit: function(){

      var salesRepEmail = this.$el.find('#sales-reps').val();
      this.loginInfoModel.set('email', salesRepEmail);
      var email = this.$el.find("#email").val();
      this.customerModel.set('email', email);

      var firstName = this.$el.find("#first-name").val();
      this.customerModel.set('firstName', firstName);

      var lastName = this.$el.find("#last-name").val();
      this.customerModel.set('lastName', lastName);

      var phone = this.$el.find("#phone").val();
      this.customerModel.set('phone', phone);

      this.sendLead();

    },

    renderThankYouTemplate: function() {

      this.showSpinner();

      setTimeout(_.bind(function() {
        //var template = _.template(AssessmentThankYouTemplate);
        //this.$el.html(template);
      }, this), 3000);
    },

    showSpinner: function() {
      var $loading = this.$el.find('#loading');
      this.spinner.spin($loading[0]);
      $loading.fadeIn(800);
    }
  });

  return ViewTheWorld.Views.Video;
});