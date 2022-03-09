var mapView = function () {

  "use strict";
  //---#2.1 caseNoTimeSeriesInCsv---start------------------------------------
  //---#1 GoalDependendMapColor---start--------------------------------------
  //this.initialise = function(geoData, geoCodeRegEx) {
  //this.initialise = function(geoData, geoCodeRegEx, goal) {
  //---#1 GoalDependendMapColor---stop---------------------------------------
  this.initialise = function(geoData, geoCodeRegEx, goal, title, measurementUnit, mapTitle) { //, mapTitle
  //---#2.1 caseNoTimeSeriesInCsv---stop-------------------------------------
    $('.map').show();
    $('#map').sdgMap({
      geoData: geoData,
      geoCodeRegEx: geoCodeRegEx,
      mapOptions: {{ site.map_options | jsonify }},
      mapLayers: {{ site.map_layers | jsonify }},
      //---#1 GoalDependendMapColor---start--------------------------------------
      goal: goal,
      //---#1 GoalDependendMapColor---stop---------------------------------------

      //---#2.2 footerUnitInMapLegend---start----------------------------------------------------------
      measurementUnit: measurementUnit,
      //---#2.2 footerUnitInMapLegend---stop-----------------------------------------------------------
      mapTitle: mapTitle,

      title: title
    });
  };
};
