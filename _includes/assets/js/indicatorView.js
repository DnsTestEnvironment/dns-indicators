var indicatorView = function (model, options) {

  "use strict";

  var view_obj = this;
  this._model = model;

  this._chartInstance = undefined;
  this._rootElement = options.rootElement;
  this._tableColumnDefs = options.tableColumnDefs;
  this._mapView = undefined;
  this._legendElement = options.legendElement;


  var chartHeight = screen.height < options.maxChartHeight ? screen.height : options.maxChartHeight;

  $('.plot-container', this._rootElement).css('height', chartHeight + 'px');

  $(document).ready(function() {
    $(view_obj._rootElement).find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      if($(e.target).attr('href') == '#tableview') {
        setDataTableWidth($(view_obj._rootElement).find('#selectionsTable table'));
      } else {
        $($.fn.dataTable.tables(true)).css('width', '100%');
        $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
      }
    });

    $(view_obj._legendElement).on('click', 'li', function(e) {
      $(this).toggleClass('notshown');

      var ci = view_obj._chartInstance,
          index = $(this).data('datasetindex'),
          meta = ci.getDatasetMeta(index);

      meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
      ci.update();
    });

    // Provide the hide/show functionality for the sidebar.
    $('.data-view .nav-link').on('click', function(e) {
      var $sidebar = $('#indicator-sidebar'),
          $main = $('#indicator-main'),
          hideSidebar = $(this).data('no-disagg'),
          mobile = window.matchMedia("screen and (max-width: 990px)");
      if (hideSidebar) {
        $sidebar.addClass('indicator-sidebar-hidden');
        $main.addClass('indicator-main-full');
        // On mobile, this can be confusing, so we need to scroll to the tabs.
        if (mobile.matches) {
          $([document.documentElement, document.body]).animate({
            scrollTop: $("#indicator-main").offset().top - 40
          }, 400);
        }
      }
      else {
        $sidebar.removeClass('indicator-sidebar-hidden');
        $main.removeClass('indicator-main-full');
      }
    });
  });

  this._model.onDataComplete.attach(function (sender, args) {

    if(view_obj._model.showData) {

      $('#dataset-size-warning')[args.datasetCountExceedsMax ? 'show' : 'hide']();

      if(!view_obj._chartInstance) {
        view_obj.createPlot(args);
      } else {
        view_obj.updatePlot(args);
      }
    }

    view_obj.createSelectionsTable(args);
  });

  this._model.onNoHeadlineData.attach(function(sender, args) {
    // Force a unit if necessary.
    if (args && args.forceUnit) {
      $('#units input[type="radio"]')
        .filter('[value="' + args.forceUnit + '"]')
        .first()
        .click();
    }
    // Force particular minimum field selections if necessary. We have to delay
    // this slightly to make it work...
    if (args && args.minimumFieldSelections && _.size(args.minimumFieldSelections)) {
      function getClickFunction(fieldToSelect, fieldValue) {
        return function() {
          $('#fields .variable-options input[type="checkbox"]')
            .filter('[data-field="' + fieldToSelect + '"]')
            .filter('[value="' + fieldValue + '"]')
            .filter(':not(:checked)')
            .first()
            .click();
        }
      }

      for (var fieldToSelect in args.minimumFieldSelections) {
        var fieldValue = args.minimumFieldSelections[fieldToSelect];
        //--#21 allowMultipleStartValues---start------------------------------
        //setTimeout(getClickFunction(fieldToSelect, fieldValue), 500);
        if (typeof args.minimumFieldSelections[fieldToSelect] == 'object'){
          //console.log('M: ',args.minimumFieldSelections, args.minimumFieldSelections[fieldToSelect], typeof args.minimumFieldSelections[fieldToSelect]);
          _.each(fieldValue, function(multiValue){
            setTimeout(getClickFunction(fieldToSelect, multiValue), 500);
          });
        }
        else {
          //console.log('S: ',args.minimumFieldSelections, args.minimumFieldSelections[fieldToSelect], typeof args.minimumFieldSelections[fieldToSelect]);
          setTimeout(getClickFunction(fieldToSelect, fieldValue), 500);
        }
        //--#21 allowMultipleStartValues---stop------------------------------

      }
    }
    else {
      // Fallback behavior - just click on the first one, whatever it is.
      // Also needs to be delayed...
      setTimeout(function() {
        $('#fields .variable-options :checkbox:eq(0)').trigger('click');
      }, 500);
    }
  });

  this._model.onSeriesComplete.attach(function(sender, args) {
    view_obj.initialiseSeries(args);

    //---#1 GoalDependendMapColor---start--------------------------
    if (args.indicatorId.indexOf('_1-') != -1){var goalNr = 0;}
    else if (args.indicatorId.indexOf('_2-') != -1) {var goalNr = 1;}
    else if (args.indicatorId.indexOf('_3-') != -1) {var goalNr = 2;}
    else if (args.indicatorId.indexOf('_4-') != -1) {var goalNr = 3;}
    else if (args.indicatorId.indexOf('_5-') != -1) {var goalNr = 4;}
    else if (args.indicatorId.indexOf('_6-') != -1) {var goalNr = 5;}
    else if (args.indicatorId.indexOf('_7-') != -1) {var goalNr = 6;}
    else if (args.indicatorId.indexOf('_8-') != -1) {var goalNr = 7;}
    else if (args.indicatorId.indexOf('_9-') != -1) {var goalNr = 8;}
    else if (args.indicatorId.indexOf('_10-') != -1) {var goalNr = 9;}
    else if (args.indicatorId.indexOf('_11-') != -1) {var goalNr = 10;}
    else if (args.indicatorId.indexOf('_12-') != -1) {var goalNr = 11;}
    else if (args.indicatorId.indexOf('_13-') != -1) {var goalNr = 12;}
    else if (args.indicatorId.indexOf('_14-') != -1) {var goalNr = 13;}
    else if (args.indicatorId.indexOf('_15-') != -1) {var goalNr = 14;}
    else if (args.indicatorId.indexOf('_16-') != -1) {var goalNr = 15;}
    else if (args.indicatorId.indexOf('_17-') != -1) {var goalNr = 16;}
    //---#1 GoalDependendMapColor---stop---------------------------
    if(args.hasGeoData && args.showMap) {
      view_obj._mapView = new mapView();
      //---#2 TimeSeriesNameDisplayedInMaps---start------------------
      //---#1 GoalDependendMapColor---start--------------------------
      //view_obj._mapView.initialise(args.geoData, args.geoCodeRegEx);
      //view_obj._mapView.initialise(args.geoData, args.geoCodeRegEx, goalNr);
      //---#1 GoalDependendMapColor---stop---------------------------
      console.log("Args: ", args);
      view_obj._mapView.initialise(args.geoData, args.geoCodeRegEx, goalNr, args.title, args.measurementUnit, args.mapTitle); //---#2.2 footerUnitInMapLegend  , args.mapTitle
      //---#2 TimeSeriesNameDisplayedInMaps---stop------------------

    }
  });

  this._model.onSeriesSelectedChanged.attach(function(sender, args) {
    // var selector;
    // if (args.series.length === view_obj._fieldLimit) {
    //   selector = $('#fields input:not(:checked)');
    //   selector.attr('disabled', true);
    //   selector.parent().addClass('disabled').attr('title', 'Maximum of ' + view_obj._fieldLimit + ' selections; unselect another to select this field');
    // } else {
    //   selector = $('#fields input');
    //   selector.removeAttr('disabled');
    //   selector.parent().removeClass('disabled').removeAttr('title');
    // }
  });

  this._model.onUnitsComplete.attach(function(sender, args) {
    view_obj.initialiseUnits(args);
  });

  this._model.onUnitsSelectedChanged.attach(function(sender, args) {
    // update the plot's y axis label
    // update the data
  });

  this._model.onFieldsCleared.attach(function(sender, args) {
    $(view_obj._rootElement).find(':checkbox').prop('checked', false);
    $(view_obj._rootElement).find('#clear').addClass('disabled');

    // reset available/unavailable fields
    updateWithSelectedFields();

    // #246
    $(view_obj._rootElement).find('.selected').css('width', '0');
    // end of #246
  });

  this._model.onSelectionUpdate.attach(function(sender, args) {
    $(view_obj._rootElement).find('#clear')[args.selectedFields.length ? 'removeClass' : 'addClass']('disabled');

    // loop through the available fields:
    $('.variable-selector').each(function(index, element) {
      var currentField = $(element).data('field');

      // any info?
      var match = _.findWhere(args.selectedFields, { field : currentField });
      var element = $(view_obj._rootElement).find('.variable-selector[data-field="' + currentField + '"]');
      var width = match ? (Number(match.values.length / element.find('.variable-options label').length) * 100) + '%' : '0';

      $(element).find('.bar .selected').css('width', width);

      // is this an allowed field:
      $(element)[_.contains(args.allowedFields, currentField) ? 'removeClass' : 'addClass']('disallowed');
    });
  });

  this._model.onFieldsStatusUpdated.attach(function (sender, args) {
    //console.log('updating field states with: ', args);

    // reset:
    $(view_obj._rootElement).find('label').removeClass('selected possible excluded');

    _.each(args.data, function(fieldGroup) {
      _.each(fieldGroup.values, function(fieldItem) {
        var element = $(view_obj._rootElement).find(':checkbox[value="' + fieldItem.value + '"][data-field="' + fieldGroup.field + '"]');
        element.parent().addClass(fieldItem.state).attr('data-has-data', fieldItem.hasData);
      });
      // Indicate whether the fieldGroup had any data.
      var fieldGroupElement = $(view_obj._rootElement).find('.variable-selector[data-field="' + fieldGroup.field + '"]');
      fieldGroupElement.attr('data-has-data', fieldGroup.hasData);

      // Re-sort the items.
      view_obj.sortFieldGroup(fieldGroupElement);
    });

    _.each(args.selectionStates, function(ss) {
      // find the appropriate 'bar'
      var element = $(view_obj._rootElement).find('.variable-selector[data-field="' + ss.field + '"]');
      element.find('.bar .default').css('width', ss.fieldSelection.defaultState + '%');
      element.find('.bar .possible').css('width', ss.fieldSelection.possibleState + '%');
      element.find('.bar .excluded').css('width', ss.fieldSelection.excludedState + '%');
    });
  });

  $(this._rootElement).on('click', '#clear', function() {
    view_obj._model.clearSelectedFields();
  });

  $(this._rootElement).on('click', '#fields label', function (e) {

    if(!$(this).closest('.variable-options').hasClass('disallowed')) {
      $(this).find(':checkbox').trigger('click');
    }

    e.preventDefault();
    e.stopPropagation();
  });

  $(this._rootElement).on('change', '#units input', function() {
    view_obj._model.updateSelectedUnit($(this).val());
  });

  // generic helper function, used by clear all/select all and individual checkbox changes:
  var updateWithSelectedFields = function() {
    view_obj._model.updateSelectedFields(_.chain(_.map($('#fields input:checked'), function (fieldValue) {
      return {
        value: $(fieldValue).val(),
        field: $(fieldValue).data('field')
      };
    })).groupBy('field').map(function(value, key) {
      return {
        field: key,
        values: _.pluck(value, 'value')
      };
    }).value());
  }

  $(this._rootElement).on('click', '.variable-options button', function(e) {
    var type = $(this).data('type');
    var $options = $(this).closest('.variable-options').find(':checkbox');

    // The clear button can clear all checkboxes.
    if (type == 'clear') {
      $options.prop('checked', false);
    }
    // The select button must only select checkboxes that have data.
    if (type == 'select') {
      $options.parent().not('[data-has-data=false]').find(':checkbox').prop('checked', true)
    }

    updateWithSelectedFields();

    e.stopPropagation();
  });

  $(this._rootElement).on('click', ':checkbox', function(e) {

    // don't permit excluded selections:
    if($(this).parent().hasClass('excluded') || $(this).closest('.variable-selector').hasClass('disallowed')) {
      return;
    }

    updateWithSelectedFields();

    e.stopPropagation();
  });

  $(this._rootElement).on('click', '.variable-selector', function(e) {
    var currentSelector = e.target;

    var currentButton = getCurrentButtonFromCurrentSelector(currentSelector);

    var options = $(this).find('.variable-options');
    var optionsAreVisible = options.is(':visible');
    $(options)[optionsAreVisible ? 'hide' : 'show']();
    currentButton.setAttribute("aria-expanded", optionsAreVisible ? "true" : "false");

    var optionsVisibleAfterClick = options.is(':visible');
    currentButton.setAttribute("aria-expanded", optionsVisibleAfterClick ? "true" : "false");

    e.stopPropagation();
  });

  function getCurrentButtonFromCurrentSelector(currentSelector){
    if(currentSelector.tagName === "H5"){
      return currentSelector.parentElement;
    }
    else if(currentSelector.tagName === "BUTTON"){
      return currentSelector;
    }
  }

  this.initialiseSeries = function(args) {
    if(args.series.length) {
      var template = _.template($("#item_template").html());

      if(!$('button#clear').length) {
        $('<button id="clear" class="disabled">' + translations.indicator.clear_selections + ' <i class="fa fa-remove"></i></button>').insertBefore('#fields');
      }

      $('#fields').html(template({
        series: args.series,
        allowedFields: args.allowedFields,
        edges: args.edges
      }));

      $(this._rootElement).removeClass('no-series');

    } else {
      $(this._rootElement).addClass('no-series');
    }
  };

  this.initialiseUnits = function(args) {
    var template = _.template($('#units_template').html()),
        units = args.units || [],
        selectedUnit = args.selectedUnit || null;

    $('#units').html(template({
      units: units,
      selectedUnit: selectedUnit
    }));

    if(!units.length) {
      $(this._rootElement).addClass('no-units');
    }
  };

  this.updatePlot = function(chartInfo) {
    // No Line for Targets--------------------------------------------------------------------------------------------
    for (var set = 0; set<chartInfo.datasets.length; set++){

      //if (chartInfo.datasets[set].label.substr(0,4)=='Ziel'){
        //cartInfo.datasets[set].push("showLines: false")
      //}
      //console.log (set, chartInfo.datasets);
    };
    //----------------------------------------------------------------------------------------------------------------

    view_obj._chartInstance.data.datasets = chartInfo.datasets;



    if(chartInfo.selectedUnit) {
      view_obj._chartInstance.options.scales.yAxes[0].scaleLabel.labelString = translations.t(chartInfo.selectedUnit);
    }

    // Create a temp object to alter, and then apply. We go to all this trouble
    // to avoid completely replacing view_obj._chartInstance -- and instead we
    // just replace it's properties: "type", "data", and "options".
    //var updatedConfig = opensdg.chartConfigAlter({
    var updatedConfig = opensdg.chartConfigAlter({
      type: view_obj._chartInstance.type,
      data: view_obj._chartInstance.data,
      options: view_obj._chartInstance.options
    });

    view_obj._chartInstance.type = updatedConfig.type;
    view_obj._chartInstance.data = updatedConfig.data;
    view_obj._chartInstance.options = updatedConfig.options;

    view_obj._chartInstance.update(1000, true);

    $(this._legendElement).html(view_obj._chartInstance.generateLegend());
  };


  this.createPlot = function (chartInfo) {
    //console.log("chartinfox",chartInfo);

    var that = this;

    var chartConfig = {
      type: this._model.graphType,
      data: chartInfo,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: true,
        scrollX: true,
        scrollCollapse: true,
        sScrollXInner: '150%',
        scales: {
          xAxes: [{
            maxBarThickness: 150,
            gridLines: {
              color: '#ddd',
            }
          }],
          yAxes: [{
              ticks: {
              suggestedMin: 0
            },
            scaleLabel: {
              display: this._model.selectedUnit ? translations.t(this._model.selectedUnit) : this._model.measurementUnit,
              labelString: this._model.selectedUnit ? translations.t(this._model.selectedUnit) : this._model.measurementUnit
            }
          }]
        },
        legendCallback: function(chart) {
            //console.log("chart: ", chart);
            var text = ['<ul id="legend" style="text-align: left; padding-left: 0px">'];// #18.3 lengend entries on the left >>> var text = ['<ul id="legend">'];

            //---#18 structureLegendEntries---start------------------------------------
            //vvv #18.1 vvvv sort the dataset by substring if it contains "target" or "timeseries"
            var temp = [];
            _.each(chart.data.datasets, function(dataset, datasetIndex) {
              temp.push({label: dataset.label, borderDash: dataset.borderDash, backgroundColor: dataset.backgroundColor, borderColor: dataset.borderColor, pointBorderColor: dataset.pointBorderColor, datasetIndex: datasetIndex, type: dataset.type});
            });
            var replaceForOrder = [{old: 'Insgesamt', new:'AAA'},
                                  {old: 'Total', new: 'AAA'},
                                  {old: 'Deutschland', new: 'AAA'},
                                  {old: 'Germany', new: 'AAA'},
                                  {old: 'Straftaten (insgesamt)', new: 'AAA'},
                                  {old: 'Criminal offences (total)', new: 'AAA'},
                                  {old: 'Index insgesamt', new: 'AAA'},
                                  {old: 'Index (overall)', new: 'AAA'},
                                  {old: 'Berechnete jährliche Werte', new: 'AAA'}];

            var sorted = temp.sort(function(a, b) {
              var sub = a.label.substr(0,4);
              if (sub == 'Ziel' || sub == 'Targ' || sub == 'Zeit' || sub == 'Time'){
                //var subA = a.label.substr(a.label.indexOf(','), a.label.length).replace('Insgesamt', 'AAA').replace('Total','AAA').replace('Deutschland', 'AAA').replace('Germany','AAA').replace('Straftaten (insgesamt)','AAA');
                //var subB = b.label.substr(b.label.indexOf(','), b.label.length).replace('Insgesamt', 'AAA').replace('Total','AAA').replace('Deutschland', 'AAA').replace('Germany','AAA').replace('Straftaten (insgesamt)','AAA');
                var subA = a.label.substr(a.label.indexOf(','), a.label.length)
                var subB = b.label.substr(b.label.indexOf(','), b.label.length)
                for (var i=0; i<replaceForOrder.length; i++){
                  //console.log('1:',subA);
                  subA = subA.replace(replaceForOrder[i]['old'],replaceForOrder[i]['new']);
                  subB = subB.replace(replaceForOrder[i]['old'],replaceForOrder[i]['new']);
                  //console.log('2:',subA)
                }

              }
              else{
                var subA = a.label.replace('Insgesamt', 'AAA').replace('Total','AAA').replace('Deutschland', 'AAA').replace('Germany','AAA');
                var subB = b.label.replace('Insgesamt', 'AAA').replace('Total','AAA').replace('Deutschland', 'AAA').replace('Germany','AAA');
              }

              return (subA > subB) - (subA < subB);
            });
            console.log('Sorted:',sorted);
            //^^^^ #18.1 ^^^^
            _.each(sorted, function(dataset) { //#18.2 use the sorted dataset instead of the original >>> _.each(chart.data.datasets, function(dataset, datasetIndex) {

              text.push('<li data-datasetindex="' + dataset.datasetIndex + '">'); //#18.2 >>> text.push('<li data-datasetindex="' + datasetIndex + '">');

              // vvv #18.4 vvvv indent the entries by the number of commas----------
              var indent = '<span>';

              // replace parts that contain a comma which is no separator---
              var label = dataset.label;

              var replace = [{old: '2,5', new: '2.5'},
                            {old: 'Siedlungsfläche: Wohnbau, Industrie und Gewerbe (ohne Abbauland), Öffentliche Einrichtungen', new: 'Siedlungsfläche: Wohnbau Industrie und Gewerbe (ohne Abbauland) Öffentliche Einrichtungen'},
                            {old: 'Siedlungsfläche: Sport-, Freizeit-, und Erholungsfläche, Friedhof', new: 'Siedlungsfläche: Sport- Freizeit- und Erholungsfläche Friedhof'},
                            {old: 'Sport-, Freizeit- und Erholungsfläche, Friedhof', new: 'Sport- Freizeit- und Erholungsfläche Friedof'},
                            {old: 'Wohnbau, Industrie und Gewerbe (ohne Abbauland), Öffentliche Einrichtungen', new: 'Wohnbau Industrie und Gewerbe (ohne Abbauland) Öffentliche Einrichtungen'},
                            {old: 'Konsum, Investitionen und Exporte', new: 'Konsum Investitionen und Exporte'},
                            {old: 'Entwicklungszusammenarbeit, deren', new: 'Entwicklungszusammenarbeit deren'},
                            {old: 'Moving five-year average, referring to the middle year', new: 'Moving five-year average referring to the middle year'},
                            {old: 'onsumption, investments', new: 'onsumption investments'},
                            {old: 'area, c', new: 'area c'},
                            ];

              for (var i=0; i<replace.length; i++){
                label = label.replace(replace[i]['old'], replace[i]['new']);
              };
              //-----------------------------------------------------------
              var exc = 0;
              var exceptions = ['Deutschland', 'Germany',
                                'Insgesamt', 'Total',
                                'Index insgesamt', 'Index overall'];
              for (var j=0; j<exceptions.length; j++){
                if (label.indexOf(exceptions[j]) != -1){
                  exc += 1;
                }
              }


              //if (label.indexOf('Deutschland (insgesamt)') != -1 || label.indexOf('Germany (total)') != -1) {
                //exc = 1;
              //}
              for (var i=0; i<label.split(',').length - exc; i++){
                indent = indent.concat('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
              };
              indent = indent.concat('</span>');
              text.push(indent);
              // ^^^^ #18.4 ^^^^----------------------------------------------------

              //---#3 targetDifferentInLegend---start----------------------------------------------------------------------------------------------------------------------------
              //text.push('<span class="swatch' + (dataset.borderDash ? ' dashed' : '') + '" style="background-color: ' + dataset.backgroundColor + '">');
              dashedLines = ['Ziel, Sanitärvers','Ziel, Trinkwasser','Ziel, Finanzierun','Ziel, Strukturell'
                              ,'Target, Sanitärve','Target, Trinkwass','Target, Finanzier','Target, Strukture']
              if (dataset.label.substr(0,4) == 'Ziel' || dataset.label.substr(0,6) == 'Target'){
                if (dataset.type != 'bar'){
                  //edit legend for dashed target lines
                  if (dashedLines.indexOf(dataset.label.substring(0,17)) != -1){
                    text.push('<span class="swatchTgtLine dashed" style="background-color: ' + dataset.pointBorderColor + '"></span>');
                  }
                  else {
                    text.push('<span class="swatchTgt' + '" style="border-color: ' + dataset.pointBorderColor + '"></span>');
                  }
                  //text.push('<span class="swatchTgt' + '" style="border-color: ' + dataset.pointBorderColor + '"></span>');
                  //
                }
                else{
                  text.push('<span class="swatchTgtBar' + '" style="border-color: ' + dataset.pointBorderColor + '"></span>');
                }
              }
              else if (dataset.type != 'bar'){
                text.push('<span class="swatchLine' + (dataset.borderDash ? ' dashed' : '') + ' left" style="background-color: ' + dataset.pointBorderColor + '"></span>');
                text.push('<span class="swatchTsr' + (dataset.borderDash ? ' dashed' : '') + '" style="border-color: ' + dataset.pointBorderColor + '"></span>');
                text.push('<span class="swatchLine' + (dataset.borderDash ? ' dashed' : '') + ' right" style="background-color: ' + dataset.pointBorderColor + '"></span>');
              }
              else{
                text.push('<span class="swatchBar' + (dataset.borderDash ? ' dashed' : '') + '" style="background-color: ' + dataset.pointBorderColor + '"></span>');
              }
              //---#3 targetDifferentInLegend---stop-----------------------------------------------------------------------------------------------------------------------------



              text.push(translations.t(dataset.label));
              text.push('</li>');

            });

            text.push('</ul>');
            return text.join('');
        },


        legend: {
          display: false,
        },
        title: {
          display: false
        },
        plugins: {
          scaler: {}
        }
      }
    };
    chartConfig = opensdg.chartConfigAlter(chartConfig);
    //console.log(chartInfo);

    this._chartInstance = new Chart($(this._rootElement).find('canvas'), chartConfig);
    Chart.pluginService.register({
      afterDraw: function(chart) {
        var $canvas = $(that._rootElement).find('canvas'),
        font = '12px Arial',
        canvas = $canvas.get(0),
        textRowHeight = 20,
        ctx = canvas.getContext("2d");

        ctx.font = font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#6e6e6e';
      }
    });

    this.createTableFooter('selectionChartFooter', chartInfo.footerFields, '#chart-canvas');
    //this.createDownloadButton(chartInfo.selectionsTable, 'Chart', chartInfo.indicatorId, '#selectionsChart');
    this.createSourceButton(chartInfo.shortIndicatorId, '#selectionsChart');

    $("#btnSave").click(function() {
      var filename = chartInfo.indicatorId + '.png',
          element = document.getElementById('chart-canvas'),
          height = element.clientHeight + 25,
          width = element.clientWidth + 25;
      var options = {
        // These options fix the height, width, and position.
        height: height,
        width: width,
        windowHeight: height,
        windowWidth: width,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        // Allow a chance to alter the screenshot's HTML.
        onclone: function(clone) {
          // Add a body class so that the screenshot style can be custom.
          clone.body.classList.add('image-download-in-progress');
        },
        // Decide which elements to skip.
        ignoreElements: function(el) {
          // Keep all style, head, and link elements.
          var keepTags = ['STYLE', 'HEAD', 'LINK'];
          if (keepTags.indexOf(el.tagName) !== -1) {
            return false;
          }
          // Keep all elements contained by (or containing) the screenshot
          // target element.
          if (element.contains(el) || el.contains(element)) {
            return false;
          }
          // Leave out everything else.
          return true;
        }
      };
      // First convert the target to a canvas.
      html2canvas(element, options).then(function(canvas) {
        // Then download that canvas as a PNG file.
        canvas.toBlob(function(blob) {
          saveAs(blob, filename);
        });
      });
    });

    $(this._legendElement).html(view_obj._chartInstance.generateLegend());
  };

  this.toCsv = function (tableData) {
    var lines = [],
    headings = _.map(tableData.headings, function(heading) { return '"' + translations.t(heading) + '"'; });

    lines.push(headings.join(','));

    _.each(tableData.data, function (dataValues) {
      var line = [];

      _.each(headings, function (heading, index) {
        line.push(dataValues[index]);
      });

      lines.push(line.join(','));
    });

    return lines.join('\n');
  };

  var setDataTableWidth = function(table) {
    table.find('thead th').each(function() {
      var textLength = $(this).text().length;
      for(var loop = 0; loop < view_obj._tableColumnDefs.length; loop++) {
        var def = view_obj._tableColumnDefs[loop];
        if(textLength < def.maxCharCount) {
          if(!def.width) {
            $(this).css('white-space', 'nowrap');
          } else {
            $(this).css('width', def.width + 'px');
            $(this).data('width', def.width);
          }
          break;
        }
      }
    });

    table.removeAttr('style width');

    var totalWidth = 0;
    table.find('thead th').each(function() {
      if($(this).data('width')) {
        totalWidth += $(this).data('width');
      } else {
        totalWidth += $(this).width();
      }
    });

    // ascertain whether the table should be width 100% or explicit width:
    var containerWidth = table.closest('.dataTables_wrapper').width();

    if(totalWidth > containerWidth) {
      table.css('width', totalWidth + 'px');
    } else {
      table.css('width', '100%');
    }
  };

  var initialiseDataTable = function(el) {
    var datatables_options = options.datatables_options || {
      paging: false,
      bInfo: false,
      bAutoWidth: false,
      searching: false,
      responsive: false,
      order: [[0, 'asc']]
    }, table = $(el).find('table');

    datatables_options.aaSorting = [];

    table.DataTable(datatables_options);

    setDataTableWidth(table);
  };


  this.createSelectionsTable = function(chartInfo) {
    console.log("chartInfo:", chartInfo);
    //---#19 addUnitToTableHeaderIfNeeded---start---------------------------------------------------
    //---Edit from 26.10.20: Add Unit to table heading
    //var tableUnit = (chartInfo.selectedUnit && !chartInfo.footerFields[translations.indicator.unit_of_measurement]) ? translations.t(chartInfo.selectedUnit) : '';
    //var tableUnit = (chartInfo.indicatorId == 'indicator_6-1-b' || chartInfo.indicatorId == 'indicator_6-1-a') ? '' : ' (' + chartInfo.footerFields[translations.indicator.unit_of_measurement] + ')';
    if (chartInfo.indicatorId ===  'indicator_8-2-ab'){
      var tableUnit = '<br><small>in %</small>';
    }
    else{
      var tableUnit =  '<br><small>' + chartInfo.footerFields[translations.indicator.unit_of_measurement] + '</small>';
    }

    //this.createTable(chartInfo.selectionsTable, chartInfo.indicatorId, '#selectionsTable', true);
    this.createTable(chartInfo.selectionsTable, tableUnit, chartInfo.indicatorId, '#selectionsTable', true);
    //---#19 addUnitToTableHeaderIfNeeded---stop----------------------------------------------------
    this.createTableFooter('selectionTableFooter', chartInfo.footerFields, '#selectionsTable');
    this.createDownloadButton(chartInfo.selectionsTable, 'Table', chartInfo.indicatorId, '#selectionsTable');
    this.createSourceButton(chartInfo.shortIndicatorId, '#selectionsTable');
  };

  this.createDownloadButton = function(table, name, indicatorId, el) {
    if(window.Modernizr.blobconstructor) {
      var downloadKey = 'download_csv';
      if (name == 'Chart') {
        downloadKey = 'download_chart';
      }
      if (name == 'Table') {
        downloadKey = 'download_table';
      }
      var gaLabel = 'Download ' + name + ' CSV: ' + indicatorId.replace('indicator_', '');
      $(el).append($('<a />').text(translations.indicator[downloadKey])
      .attr(opensdg.autotrack('download_data_current', 'Downloads', 'Download CSV', gaLabel))
      .attr({
        'href': URL.createObjectURL(new Blob([this.toCsv(table)], {
          type: 'text/csv'
        })),
        'download': indicatorId + '.csv',
        'title': translations.indicator.download_csv_title,
        'class': 'btn btn-primary btn-download',
        'tabindex': 0
      })
      .data('csvdata', this.toCsv(table)));
    } else {
      var headlineId = indicatorId.replace('indicator', 'headline');
      var id = indicatorId.replace('indicator_', '');
      var gaLabel = 'Download Headline CSV: ' + id;
      $(el).append($('<a />').text(translations.indicator.download_headline)
      .attr(opensdg.autotrack('download_data_headline', 'Downloads', 'Download CSV', gaLabel))
      .attr({
        'href': opensdg.remoteDataBaseUrl + '/headline/' + id + '.csv',
        'download': headlineId + '.csv',
        'title': translations.indicator.download_headline_title,
        'class': 'btn btn-primary btn-download',
        'tabindex': 0
      }));
    }
  }

  this.createSourceButton = function(indicatorId, el) {
    var gaLabel = 'Download Source CSV: ' + indicatorId;
    $(el).append($('<a />').text(translations.indicator.download_source)
    .attr(opensdg.autotrack('download_data_source', 'Downloads', 'Download CSV', gaLabel))
    .attr({
      'href': opensdg.remoteDataBaseUrl + '/data/' + indicatorId + '.csv',
      'download': indicatorId + '.csv',
      'title': translations.indicator.download_source_title,
      'class': 'btn btn-primary btn-download',
      'tabindex': 0
    }));
  }
  //---#19 addUnitToTableHeaderIfNeeded---start---------------------------------------------------
  this.createTable = function(table, tableUnit, indicatorId, el) {
  //---#19 addUnitToTableHeaderIfNeeded---stop----------------------------------------------------
    options = options || {};
    var that = this,
    csv_path = options.csv_path,
    allow_download = options.allow_download || false,
    csv_options = options.csv_options || {
      separator: ',',
      delimiter: '"'
    },
    table_class = options.table_class || 'table table-hover';

    // clear:
    $(el).html('');

    if(table && table.data.length) {
      var currentTable = $('<table />').attr({
        'class': /*'table-responsive ' +*/ table_class,
        'width': '100%'
        //'id': currentId
      });

      //---Edit from 26.10.2020: Add Unit to table headings
      currentTable.append('<caption>' + that._model.chartTitle +  tableUnit + '</caption>');

      var table_head = '<thead><tr>';

      var getHeading = function(heading, index) {
        var span = '<span class="sort" />';
        var span_heading = '<span>' + translations.t(heading) + '</span>';
        //---#19 addUnitToTableHeaderIfNeeded---start---------------------------------------------------
        //---Undo via Edit from 26.10.20
        return (!index || heading.toLowerCase() == 'units') ? span_heading + span : span + span_heading;
        //return (!index || heading.toLowerCase() == 'units') ? span_heading + span : span + span_heading + ((tableUnit == '') ? '' : ('<br>(' + tableUnit)+')');
        //---#19 addUnitToTableHeaderIfNeeded---stop----------------------------------------------------
      };
      table.headings.forEach(function (heading, index) {
        table_head += '<th' + (!index || heading.toLowerCase() == 'units' ? '': ' class="table-value"') + ' scope="col">' + getHeading(heading, index) + '</th>';
      });

      table_head += '</tr></thead>';
      currentTable.append(table_head);
      currentTable.append('<tbody></tbody>');

      table.data.forEach(function (data) {
        var row_html = '<tr>';
        table.headings.forEach(function (heading, index) {
          // For accessibility set the Year column to a "row" scope th.
          var isYear = (index == 0 || heading.toLowerCase() == 'year');
          var isUnits = (heading.toLowerCase() == 'units');
          var cell_prefix = (isYear) ? '<th scope="row"' : '<td';
          var cell_suffix = (isYear) ? '</th>' : '</td>';
          row_html += cell_prefix + (isYear || isUnits ? '' : ' class="table-value"') + '>' + (data[index] !== null ? data[index] : '-') + cell_suffix;
        });
        row_html += '</tr>';
        currentTable.find('tbody').append(row_html);
      });

      $(el).append(currentTable);

      // initialise data table
      initialiseDataTable(el);

    } else {
      $(el).append($('<p />').text('There is no data for this breakdown.'));
    }
  };

  this.createTableFooter = function(divid, footerFields, el) {
    var footdiv = $('<div />').attr({
      'id': divid,
      'class': 'table-footer-text'
    });

    _.each(footerFields, function(val, key) {
      footdiv.append($('<p />').text(key + ': ' + val));
    });

    $(el).append(footdiv);
  };


  this.sortFieldGroup = function(fieldGroupElement) {
    var sortLabels = function(a, b) {
      var aObj = { hasData: $(a).attr('data-has-data'), text: $(a).text() };
      var bObj = { hasData: $(b).attr('data-has-data'), text: $(b).text() };
      if (aObj.hasData == bObj.hasData) {
        return (aObj.text > bObj.text) ? 1 : -1;
      }
      return (aObj.hasData < bObj.hasData) ? 1 : -1;
    };
    fieldGroupElement.find('label')
    .sort(sortLabels)
    .appendTo(fieldGroupElement.find('#indicatorData .variable-options'));
  }
};
