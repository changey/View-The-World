define(function (require) {
  'use strict';
  
  var _             = require('underscore')
    , Backbone      = require('backbone')
    , ViewTheWorld  = require('viewTheWorld')
    , HeaderView    = require('views/header')
    , TourLocationsCollection  = require('collections/tourLocations')
    , TourLocationSets  = require('collections/tourLocationSets')
    , TourLocation              = require('models/tourLocation')
    , TourLocationsView  = require('views/tourLocations')
    , TourOperatorView  = require('views/tourOperator')
    , AddressSearchView  = require('views/addressSearch')
    , ElectricBillView = require('views/electricBill')
    , ActiveLocationModel = require('models/activeLocation')
    , CustomerModel = require('models/customer')
    , LeadInfoModel = require('models/leadInfo')
    , ActiveStepModel = require('models/activeStep')
    , EventBus      = require('eventBus')
    , TourTemplate = require('text!../../templates/tour.tmpl')
    , FaqcardsView        = require('views/faqcards')
    , FaqcardsCollection  = require('collections/faqcards')
    , ContactInfoView     = require('views/contactInfo')
    , HomeInfoView        = require('views/homeInfo');
    
  ViewTheWorld.Views.Tour = Backbone.View.extend({
    
    events: {
      'click #help': 'clickHelp',
      'click #contact-info-icon': 'clickContactInfo',
      'click #contact-info-cancel': 'clickContactInfo'
    },
    
    initialize: function (options) {
      this.tourLocationSets = options.tourLocationSets || new TourLocationSets();
      this.tourLocationsCollection = options.tourLocationsCollection || new TourLocationsCollection();
      
      this.loginInfoModel = options.loginInfoModel;
      this.customerModel = options.customerModel || new CustomerModel();
      
      this.leadInfoModel = new LeadInfoModel({
        customerModel: this.customerModel,
        loginInfoModel: this.loginInfoModel
      });

      this.locationSetName = this.loginInfoModel.getLocationSet();
      
      this.activeStepModel = new ActiveStepModel({step: 1});
      this.listenTo(this.activeStepModel, "change", this.render, this);
      
      this.listenTo(this.tourLocationSets, 'sync', this.render, this);
      this.tourLocationSets.fetch({
        success: _.bind(this.createSubViews, this)
      });

      $("#map-canvas").on('touchstart', _.bind(function() {
        EventBus.trigger('pauseTour');
      }, this));
    },

    getTourLocationsCollection: function(tourLocationSets) {
      var tourLocation = new TourLocation();
      var tourLocationSet = tourLocationSets.getLocationSets()[this.locationSetName];
      var tourLocationsCollection = new TourLocationsCollection();
      _.each(tourLocationSet, function(location) {
        tourLocation = new TourLocation(location);
        tourLocationsCollection.push(tourLocation);
      });
      
      return tourLocationsCollection;
    },
    
    createSubViews: function() {
      this.tourLocationsCollection = this.getTourLocationsCollection(
        this.tourLocationSets);

      this.activeLocation = new ActiveLocationModel();
      this.activeLocation.fetch();
      
      var activeLocationIndex = this.activeLocation.get('index');
      var tourLocation = activeLocationIndex === -1 ? 
        this.tourLocationsCollection.firstLocation() : this.tourLocationsCollection.at(activeLocationIndex);
      
      this.activeLocation.set('location', tourLocation);

      this.headerView = new HeaderView({
        el: '#header',
        activeStepModel: this.activeStepModel,
        customerModel: this.customerModel
      });

      this.tourOperatorView = new TourOperatorView({
        el: '#tour-operator',
        locations: this.tourLocationsCollection,
        activeLocation: this.activeLocation,
        activeStepModel: this.activeStepModel
      });
      
      this.tourLocationsView = new TourLocationsView({
        el: "#locations-display",
        locations: this.tourLocationsCollection,
        activeLocation: this.activeLocation,
        tourView: this
      });

      this.addressSearchView = new AddressSearchView({
        el: "#address-search-container",
        activeLocation: this.activeLocation,
        loginInfoModel: this.loginInfoModel,
        customerModel: this.customerModel,
        activeStepModel: this.activeStepModel,
        tourOperatorView: this.tourOperatorView
      });

      this.electricBillView = new ElectricBillView({
        el: "#monthly-bill-container",
        customerModel: this.customerModel,
        leadInfoModel: this.leadInfoModel,
        activeStepModel: this.activeStepModel
      });

      this.contactInfoView = new ContactInfoView({
        el: "#contact-info-container",
        loginInfoModel: this.loginInfoModel,
        activeStepModel: this.activeStepModel
      });
      
      this.homeInfoView = new HomeInfoView({
        el: "#monthly-bill-container",
        leadInfoModel: this.leadInfoModel,
        customerModel: this.customerModel,
        activeStepModel: this.activeStepModel,
        loginInfoModel: this.loginInfoModel,
        activeLocation: this.activeLocation
      });
    },

    render: function () {
      var template = _.template(TourTemplate, {
        activeLocationName: this.activeLocation.getName()
      });
      this.$el.find('#contents').html(template);

      this.assign(this.headerView, "#header");
      this.assign(this.contactInfoView, "#contact-info-container");
      
      //TODO-remove this later. It's here for the convienence of testing
      //this.activeStepModel.setStep(2);
      
      if(this.activeStepModel.getStep() === 1) {
        this.assign(this.tourOperatorView, '#tour-operator');
        this.assign(this.tourLocationsView, '#locations-display');
        this.assign(this.addressSearchView, '#address-search-container');
      } else {
        this.assign(this.tourOperatorView, '#tour-operator');
        this.assign(this.homeInfoView, '#monthly-bill-container');
        this.$el.find('#contact-info-form').addClass('bill');
      }

      this.faqcardsCollection = new FaqcardsCollection();
      this.faqcardsCollection.fetch({
        success: _.bind(this.renderFaqcards, this)
      });

      this.$el.find('#contact-info-container').hide();

      this.faqcardsShown = false;
      this.contactInfoShown = false;
      
      return this;
    },

    renderFaqcards: function() {

      this.faqcardsView = new FaqcardsView({
        el: '#faqcards-container',
        collection: this.faqcardsCollection
      });
      this.faqcardsView.render();
      this.faqcardsView.$el.hide();
      
    },

    clickHelp: function() {

      return (this.faqcardsShown = !this.faqcardsShown) ? this.showFaqcards() : this.hideFaqcards();

    },

    showFaqcards: function() {

      EventBus.trigger('stopTour');

      this.$el.find('#help').addClass('selected');
      this.$el.find('#contact-info-form').addClass('help');

      this.$el.find('#postcards-container').hide();
      this.$el.find('#monthly-bill-container').hide();
      this.$el.find('#map-controls-container').hide();
      this.$el.find('#address-search-container').hide();
      this.$el.find('.overlay').hide();
      this.$el.find('#locations').hide();
      this.$el.find('#faqcards-container').show();
      this.$el.find('#contact-info-form').show();
    },

    hideFaqcards: function() {
      EventBus.trigger('startTour');

      this.$el.find('#help').removeClass('selected');
      this.$el.find('#contact-info-form').removeClass('help');

      this.$el.find('#postcards-container').show();
      this.$el.find('#monthly-bill-container').show();
      this.$el.find('#map-controls-container').show();
      this.$el.find('#address-search-container').show();
      this.$el.find('.overlay').show();
      this.$el.find('#locations').show();
      this.$el.find('#faqcards-container').hide();

    },
    
    clickContactInfo: function() {
      return (this.contactInfoShown = !this.contactInfoShown) ? this.showContactInfo() : this.hideContactInfo();
    },
    
    showContactInfo: function() {
      this.$el.find('#contact-info-container').show();
    },
    
    hideContactInfo: function() {
      this.$el.find('#contact-info-container').hide();
    }
  });
  return ViewTheWorld.Views.Tour;
});
