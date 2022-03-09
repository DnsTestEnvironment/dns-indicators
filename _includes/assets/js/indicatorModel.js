var indicatorModel = function (options) {

  Array.prototype.containsValue = function(val) {
    return this.indexOf(val) != -1;
  };
  // events:
  this.onDataComplete = new event(this);
  this.onSeriesComplete = new event(this);
  this.onSeriesSelectedChanged = new event(this);
  this.onUnitsComplete = new event(this);
  this.onUnitsSelectedChanged = new event(this);
  this.onFieldsStatusUpdated = new event(this);
  this.onFieldsCleared = new event(this);
  this.onSelectionUpdate = new event(this);
  this.onNoHeadlineData = new event(this);

  // json conversion:
  var convertJsonFormat = function(data) {
    var keys = _.keys(data);

    return _.map(data[keys[0]], function(item, i) {
      return _.object(keys, _.map(keys, function(k) {
        return data[k][i];
      }));
    });
  }

  // general members:
  var that = this;
  this.data = convertJsonFormat(options.data);
  this.edgesData = convertJsonFormat(options.edgesData);
  this.hasHeadline = true;
  this.country = options.country;
  this.indicatorId = options.indicatorId;
  this.shortIndicatorId = options.shortIndicatorId;
  this.chartTitle = options.chartTitle; // + "<br>" + options.measurementUnit;
  //---4.3.21: No content but map title in maps
  this.mapTitle =   options.mapTitle;
  //---4.3.21: No content but map title in maps stop
  this.graphType = options.graphType;
  this.measurementUnit = options.measurementUnit;
  this.copyright = options.copyright;
  this.dataSource = options.dataSource;
  this.geographicalArea = options.geographicalArea;
  this.footnote = options.footnote;
  this.startValues = options.startValues;
  this.showData = options.showData;
  this.selectedFields = [];
  this.allowedFields = [];
  this.selectedUnit = undefined;
  this.fieldsByUnit = undefined;
  this.dataHasUnitSpecificFields = false;
  this.fieldValueStatuses = [];
  this.validParentsByChild = {};
  this.hasGeoData = false;
  this.geoData = [];
  this.geoCodeRegEx = options.geoCodeRegEx;
  this.showMap = options.showMap;

  this.stackedDisaggregation = options.stackedDisaggregation;

  // initialise the field information, unique fields and unique values for each field:
  (function initialise() {

    var extractUnique = function(prop) {
      return _.chain(that.data).pluck(prop).uniq().sortBy(function(year) {
        return year;
      }).value();
    };

    that.years = extractUnique('Year');

    if(that.data[0].hasOwnProperty('GeoCode')) {
      that.hasGeoData = true;

      // Year, GeoCode, Value
      that.geoData = _.filter(that.data, function(dataItem) {
        return dataItem.GeoCode;
      });
    }

    if(that.data[0].hasOwnProperty('Units')) {
      that.units = extractUnique('Units');
      that.selectedUnit = that.units[0];

      // what fields have values for a given unit?
      that.fieldsByUnit = _.chain(_.map(that.units, function(unit) {
        return _.map(_.filter(Object.keys(that.data[0]), function (key) {
              return ['Year', 'Value', 'Units'].indexOf(key) === -1;
          }), function(field) {
          return {
            unit: unit,
            field: field,
            fieldData: !!_.find(_.where(that.data, { Units: unit }), function(d) { return d[field]; })
          };
        });
      })).map(function(r) {
        return r.length ? {
          unit: r[0].unit,
          fields: _.pluck(_.where(r, { fieldData: true }), 'field')
        } : {};
      }).value();

      // determine if the fields vary by unit:
      that.dataHasUnitSpecificFields = !_.every(_.pluck(that.fieldsByUnit, 'fields'), function(fields) {
        return _.isEqual(_.sortBy(_.pluck(that.fieldsByUnit, 'fields')[0]), _.sortBy(fields));
      });
    }

    that.fieldItemStates = _.map(_.filter(Object.keys(that.data[0]), function (key) {
        return ['Year', 'Value', 'Units', 'GeoCode', 'Observation status', 'Unit multiplier', 'Unit measure'].indexOf(key) === -1;
      }), function(field) {
      return {
        field: field,
        hasData: true,
        values: _.map(_.chain(that.data).pluck(field).uniq().filter(function(f) { return f; }).sort().value(),
          function(f) { return {
            value: f,
            state: 'default',
            hasData: true
          };
        })
      };
    });

    // Set up the validParentsByChild object, which lists the parent field
    // values that should be associated with each child field value.
    var parentFields = _.pluck(that.edgesData, 'From');
    var childFields = _.pluck(that.edgesData, 'To');
    that.validParentsByChild = {};
    _.each(childFields, function(childField, fieldIndex) {
      var fieldItemState = _.findWhere(that.fieldItemStates, {field: childField});
      var childValues = _.pluck(fieldItemState.values, 'value');
      var parentField = parentFields[fieldIndex];
      that.validParentsByChild[childField] = {};
      _.each(childValues, function(childValue) {
        var rowsWithParentValues = _.filter(that.data, function(row) {
          var childMatch = row[childField] == childValue;
          var parentNotEmpty = row[parentField];
          return childMatch && parentNotEmpty;
        });
        var parentValues = _.pluck(rowsWithParentValues, parentField);
        parentValues = _.uniq(parentValues);
        that.validParentsByChild[childField][childValue] = parentValues;
      });
    });

    that.selectableFields = _.pluck(that.fieldItemStates, 'field');

    // determine if there are any 'child' fields: those that can
    // only be selected if their parent has one or more selections:
    that.allowedFields = _.difference(that.selectableFields, _.pluck(that.edgesData, 'To'));

    // prepare the data according to the rounding function:
    that.data = _.map(that.data, function(item) {

      // only apply a rounding function for non-zero values:
      if(item.Value != 0) {
        // For rounding, use a function that can be set on the global opensdg
        // object, for easier control: opensdg.dataRounding()
        if (typeof opensdg.dataRounding === 'function') {

          item.Value = opensdg.dataRounding(item.Value);
        }
      }

      // remove any undefined/null values:
      _.each(Object.keys(item), function(key) {
        if(_.isNull(item[key]) || _.isUndefined(item[key])) {
          delete item[key];
        }
      });

      return item;
    });

    that.datasetObject = {
      fill: false,
      pointHoverRadius: 5,
      pointBackgroundColor: '#ffffff',
      pointHoverBorderWidth: 1,
      tension: 0,
      spanGaps: false
    };

    that.footerFields = {};
    that.footerFields[translations.indicator.source] = that.dataSource;
    that.footerFields[translations.indicator.geographical_area] = that.geographicalArea;
    that.footerFields[translations.indicator.unit_of_measurement] = that.measurementUnit;
    that.footerFields[translations.indicator.footnote] = that.footnote;
    that.footerFields[translations.indicator.copyright] = that.copyright;
    // Filter out the empty values.
    that.footerFields = _.pick(that.footerFields, _.identity);
  }());

  var headlineColor = '777777';

  //---

  // this.colorSet = {{ site.graph_color_set | jsonify }};
  //
  //
  // var goalNumber = parseInt(this.indicatorId.slice(this.indicatorId.indexOf('_')+1,this.indicatorId.indexOf('-')));
  //
  // var goalColors = [['e5243b', '891523', 'ef7b89', '2d070b', 'f4a7b0', 'b71c2f', 'ea4f62', '5b0e17', 'fce9eb'],
  //               ['e5b735', '896d1f', 'efd385', '2d240a', 'f4e2ae', 'b7922a', 'eac55d', '5b4915', 'f9f0d6'],
  //               ['4c9f38', '2d5f21', '93c587', '0f1f0b', 'c9e2c3', '3c7f2c', '6fb25f', '1e3f16', 'a7d899'],
  //               ['c5192d', '760f1b', 'dc7581', '270509', 'f3d1d5', '9d1424', 'd04656', '4e0a12', 'e7a3ab'],
  //               ['ff3a21', 'b22817', 'ff7563', '330b06', 'ffd7d2', 'cc2e1a', 'ff614d', '7f1d10', 'ff9c90'],
  //               ['26bde2', '167187', '7cd7ed', '07252d', 'd3f1f9', '1e97b4', '51cae7', '0f4b5a', 'a8e4f3'],
  //               ['fcc30b', '977506', 'fddb6c', '322702', 'fef3ce', 'c99c08', 'fccf3b', '644e04', 'fde79d'],
  //               ['a21942', '610f27', 'c7758d', '610F28', 'ecd1d9', '811434', 'b44667', '400a1a', 'd9a3b3'],
  //               ['fd6925', '973f16', 'fda57c', '321507', 'fee1d3', 'ca541d', 'fd8750', '652a0e', 'fec3a7'],
  //               ['dd1367', '840b3d', 'ea71a3', '2c0314', 'f8cfe0', 'b00f52', 'd5358b', '580729', 'f1a0c2'],
  //               ['fd9d24', '653e0e', 'fed7a7', 'b16d19', 'fdba65', 'b14a1e', 'fd976b', '000000', 'fed2bf'],
  //               ['c9992d', '785b1b', 'dec181', '281e09', 'f4ead5', 'a07a24', 'd3ad56', '503d12', 'e9d6ab'],
  //               ['3f7e44', '254b28', '8bb18e', '0c190d', 'd8e5d9', '326436', '659769', '19321b', 'b2cbb4'],
  //               ['0a97d9', '065a82', '6cc0e8', '021e2b', 'ceeaf7', '0878ad', '3aabe0', '043c56', '9dd5ef'],
  //               ['56c02b', '337319', '99d97f', '112608', 'ddf2d4', '449922', '77cc55', '224c11', 'bbe5aa'],
  //               ['00689d', '00293e', '99c2d7', '00486d', '4c95ba', '126b80', 'cce0eb', '5a9fb0', 'a1c8d2'],
  //               ['19486a', '0a1c2a', '8ca3b4', '16377c', 'd1dae1', '11324a', '466c87', '5b73a3', '0f2656']];
  //
  // var colorSets = {'default':['7e984f', '8d73ca', 'aaa533', 'c65b8a', '4aac8d', 'c95f44'],
  //                 'sdg':['e5243b', 'dda63a', '4c9f38', 'c5192d', 'ff3a21', '26bde2', 'fcc30b', 'a21942', 'fd6925', 'dd1367','fd9d24','bf8b2e','3f7e44','0a97d9','56c02b','00689d','19486a'],
  //                 'goal': goalColors[goalNumber-1],
  //                 'custom': {{ site.graph_color_list | jsonify }}};
  //
  // this.numberOfColors = {{ site.graph_color_number | jsonify }}>colorSets[this.colorSet].length ? colorSets[this.colorSet].length : {{ site.graph_color_number | jsonify }};
  //
  // var colors = colorSets[this.colorSet].slice(0,this.numberOfColors);


  if (opensdg.chartColors){

    this.colorSet = {{ site.graph_color_set | jsonify }};
    this.numberOfColors = {{ site.graph_color_number | jsonify }};
    this.customColors = {{ site.graph_color_list | jsonify }};
    var colors = opensdg.chartColors(this.shortIndicatorId, this.colorSet, this.numberOfColors, this.customColors);
  }
  else{
    var colors = ['7e984f', '8d73ca', 'aaa533', 'c65b8a', '4aac8d', 'c95f44'];
  }

   var headlinePointstyle = 'circle';
   var pointStyles = ['circle', 'triangle', 'cross', 'crossRot', 'dash', 'line', 'rect', 'rectRounded', 'rectRot', 'star', 'triangle'];
  // allow headline + (2 x others)
  var maxDatasetCount = 2 * colors.length;

  this.getHeadline = function(fields) {
    var that = this, allUndefined = function (obj) {
      for (var loop = 0; loop < that.selectableFields.length; loop++) {
        if (obj[that.selectableFields[loop]])
          return false;
      }
      return true;
    };

    return _.chain(that.data)
      .filter(function (i) {
        return allUndefined(i);
      })
      .sortBy(function (i) {
        return that.selectedUnit ? i.Units : i.Year;
      })
      .map(function (d) {
        return _.pick(d, function(val) { return val !== null });
      })
      .value();
  };

  this.clearSelectedFields = function() {
    this.selectedFields = [];
    this.getData();
    this.onFieldsCleared.notify();
  };

  this.updateSelectedFields = function (fields) {
    this.selectedFields = fields;

    // update parent/child statuses:
    var selectedFields = _.pluck(this.selectedFields, 'field');
    _.each(this.edgesData, function(edge) {
      if(!_.contains(selectedFields, edge.From)) {
        // don't allow any child fields of this association:
        this.selectedFields = _.without(this.selectedFields, _.findWhere(this.selectedFields, {
          field: edge.From
        }));
      }
    });

    // reset the allowedFields:
    this.allowedFields = _.difference(this.selectableFields, _.pluck(this.edgesData, 'To'));

    // and reinstate based on selectedFields:
    var parentFields = _.pluck(this.edgesData, 'From');
    _.each(parentFields, function(parentField) {
      if(_.contains(selectedFields, parentField)) {
        // resinstate
        var childFields = _.chain(that.edgesData).where({ 'From' : parentField }).pluck('To').value();
        that.allowedFields = that.allowedFields.concat(childFields);
        // check each value in the child fields to see if it has data in common
        // with the selected parent value.
        var selectedParent = _.find(that.selectedFields, function(selectedField) {
          return selectedField.field == parentField;
        });
        _.each(that.fieldItemStates, function(fieldItem) {
          // We only care about child fields.
          if (_.contains(childFields, fieldItem.field)) {
            var fieldHasData = false;
            _.each(fieldItem.values, function(childValue) {
              var valueHasData = false;
              _.each(selectedParent.values, function(parentValue) {
                if (_.contains(that.validParentsByChild[fieldItem.field][childValue.value], parentValue)) {
                  valueHasData = true;
                  fieldHasData = true;
                }
              });
              childValue.hasData = valueHasData;
            });
            fieldItem.hasData = fieldHasData;
          }
        });
      }
    });

    // remove duplicates:
    that.allowedFields = _.uniq(that.allowedFields);

    this.getData();
    this.onSelectionUpdate.notify({
      selectedFields: fields,
      allowedFields: that.allowedFields
    });
  };

  this.updateSelectedUnit = function(selectedUnit) {
    this.selectedUnit = selectedUnit;

    // if fields are dependent on the unit, reset:
    this.getData({
      unitsChangeSeries: this.dataHasUnitSpecificFields
    });

    this.onUnitsSelectedChanged.notify(selectedUnit);
  };

  this.getCombinationData = function(obj) {
    var getCombinations = function(fields, arr, n) {
      var index = 0, ret = [];
      for(var i = 0; i < arr.length; i++) {
        var elem = (n == 1) ? arr[i] : arr.shift();
        var field = (n == 1) ? fields[i] : fields.shift();
        for(var j = 0; j < elem.length; j++) {
          if(n == 1) {
            ret.push({
              value: elem[j],
              field: field
            });
          } else {
            var childperm = getCombinations(fields.slice(), arr.slice(), n-1);
            for(var k = 0; k < childperm.length; k++) {
              ret.push([{
                value: elem[j],
                field: field
              }].concat(childperm[k]));
            }
          }
        }
      }
      return ret;
    };

    var	loop = 1,
        res = [],
        src = JSON.parse(JSON.stringify(obj));

    for(; loop <= src.length; loop++) {
      obj = JSON.parse(JSON.stringify(src));
      res = res.concat(getCombinations(_.pluck(obj, 'field'), _.pluck(obj, 'values'), loop));
    }

    return _.map(res, function(r) {
      if(!_.isArray(r)) {
        r = [r];
      }
      return _.object(
        _.pluck(r, 'field'),
        _.pluck(r, 'value')
      );
    });
  };

  this.getData = function(options) {

    // field: 'Grade'
    // values: ['A', 'B']
    var options = _.defaults(options || {}, {
        initial: false,
        unitsChangeSeries: false
      }),
      fields = this.selectedFields,
      selectedFieldTypes = _.pluck(fields, 'field'),
      datasets = [],
      that = this,
      seriesData = [],
      headlineTable = undefined,
      datasetIndex = 0,

      //---#4 sameColorForTargetAndTimeSeries---start-----------------
      nameList = [],
      indexList = [],
      //---#4 sameColorForTargetAndTimeSeries---stop------------------

      getCombinationDescription = function(combination) {
        return _.map(Object.keys(combination), function(key) {
          return translations.t(combination[key]);
          //return key + ' ' + combination[key];
        }).join(', ');
      },

      getColor = function(datasetIndex) {

        // offset if there is no headline data:
        if(!that.hasHeadline) {
          datasetIndex += 1;
        }

        if(datasetIndex === 0) {
          return headlineColor;
        } else {
          if(datasetIndex > colors.length) {
            return colors[datasetIndex - 1 - colors.length];
          } else {
            return colors[datasetIndex - 1];
          }
        }

        return datasetIndex === 0 ? headlineColor : colors[datasetIndex];
      },
      //---#11 setTargetPointstyle---start-----------------------------------------------------------------------------------------------
      getPointStyle = function (datasetIndex, combinationDescription) {
        dashedLines = ['Ziel, Sanitärvers','Ziel, Trinkwasser',
                        'Target, (a) Acces', 'Target, (b) Acces', 'Target, Access to',
                        'Ziel, Finanzierun','Ziel, Strukturell',
                        'Target, Financial','Target, Structura']
        if (String(combinationDescription).substr(0,4) == 'Ziel' || String(combinationDescription).substr(0,6) == 'Target'){
          return dashedLines.indexOf(combinationDescription.substr(0,17)) == -1 ? 'rect' : 'false';
        }
        else {
          return 'circle';
        }
      },
      getRadius = function(datasetIndex, combinationDescription){
        return getPointStyle(datasetIndex, combinationDescription) == 'circle' || getPointStyle(datasetIndex, combinationDescription) == 'rect' ? 5 : 0
      },
      //---#11 setTargetPointstyle---stop-----------------------------------------------------------------------------------------------

      //---#13 noLineForTargets---start-------------------------------------------------------------------------------------------------
      //-Since showLines does not work we set the opacity to 0.0 if it is a target------------------------------------------------------
      getLineStyle = function (combinationDescription, datasetIndexMod, data) {

        if (String(combinationDescription).substr(0,4) == 'Ziel' || String(combinationDescription).substr(0,6) == 'Target'){
          if (data.length == 1){
            //console.log('a',combinationDescription, datasetIndexMod)
            return true;
          }
          else{
            //console.log('b',combinationDescription, datasetIndexMod)
            return false;
          }
          //return true;//'rgba(0, 0, 0, 0.0)';
        }
        else{
          //console.log('c',combinationDescription, datasetIndexMod)
          return true;//'#' + getColor(datasetIndexMod);
        }
      },
      //---#13 noLineForTargets---stop--------------------------------------------------------------------------------------------------

      //---#22 xxx---start-------------------------------------------------------------------------------------------------
      //-Since showLines does not work we set the opacity to 0.0 if it is a target------------------------------------------------------

      getBorderColor = function(combinationDescription,datasetIndexMod,indicatorId) {
        if (getChartStyle(indicatorId) == 'bar'){
          return '#' + getColor(datasetIndexMod);
        }
        else{
          return getBackground(combinationDescription,datasetIndexMod)
        }
      }


      getBackground = function (combinationDescription, datasetIndexMod) {
        if (String(combinationDescription).substr(0,4) == 'Ziel' || String(combinationDescription).substr(0,6) == 'Target'){

          return '#ffffff';
        }
        else{
          var color = '#' + getColor(datasetIndexMod);
          return datasetIndex >= colors.length ? pattern.draw('line', color) : color;
          //return '#' + getColor(datasetIndexMod);
        }
      },
      //---#22 xxx---stop--------------------------------------------------------------------------------------------------

      stackedCharts = ['indicator_3-3-a'];
      getStacked = function(indicatorId){
        if (stackedCharts.indexOf(indicatorId) != -1) {
          return true;
        }
        else {
          return false;
        }
      },
      getStackGroup = function(indicatorId){
        if (indicatorId == 'indicator_3-2-e'){
          return ''
        }
      }

      //--#14 mixedCharts---start-------------------------------------------------------------------------------------------------------
      //barCharts = [//translations.t('a) time series')+", "+translations.t('calculated annual values'),
                  //translations.t('a) time series')+", "+translations.t('air pollutants overall'),
                  //translations.t('b) target (max)')+", "+translations.t('air pollutants overall'),
                  //translations.t('a) time series')+", "+translations.t('funding balance (share of gross domestic product (at current prices) in %)'),
                  //translations.t('a) time series')+", "+translations.t('structural funding balance (share of gross domestic product (at current prices) in %)'),
                  //translations.t('a) time series')+", "+translations.t('proportion of msy examined in all managed stocks'),
                  //translations.t('a) time series')+", "+translations.t('index overall'),
                  //translations.t('b) target (min)')+", "+translations.t('index overall')

                //]
      //getChartStyle = function (combinationDescription) {
        //if (barCharts.indexOf(String(combinationDescription)) != -1) {
          //return 'bar';
        //}
        //else {
          //return 'line';
        //}
      //},
      //--#14 mixedCharts---stop--------------------------------------------------------------------------------------------------------

      //--#14.1 barsOnly---start--------------------------------------------------------------------------------------------------------
      barCharts = ['indicator_2-1-a', 'indicator_2-2-a','indicator_3-1-e','indicator_3-2-a','indicator_3-3-a','indicator_5-1-b','indicator_5-1-c','indicator_5-1-e','indicator_6-2-ab','indicator_8-2-ab', 'indicator_8-2-c','indicator_8-3-a',
      'indicator_8-4-a','indicator_8-6-a','indicator_11-1-a','indicator_11-1-b','indicator_11-2-c','indicator_12-1-a','indicator_13-1-b','indicator_14-1-b','indicator_15-1-a','indicator_15-2-a','indicator_16-1-a','indicator_16-2-a','indicator_17-1-a','indicator_17-2-a'];

      bl = ['bw','by','be','bb','hb','hh','he','mv','ni','nw','rp','sl','sn','st','sh','th'];

      exceptions = [translations.t('direct co2 emissions and co2 content of consumer goods'),
                    translations.t('a) time series') + ', ' + translations.t('a) total (moving four-year average)'),
                    translations.t('b) target (max)') + ', ' + translations.t('a) total (moving four-year average)'),
                    translations.t('a) time series') + ', ' + translations.t('gross domestic produkt (price-adjusted) (year-on-year changes in %)'),
                    translations.t('b) target (min)') + ', ' + translations.t('structural funding balance (share of gross domestic product (at current prices) in %)'),
                    translations.t('b) target (min)') + ', ' + translations.t('funding balance (share of gross domestic product (at current prices) in %)'),
                    translations.t('b) target (min)') + ', ' + translations.t('a) drinking water and sanitation'),//6.2.ab
                    translations.t('b) target (min)') + ', ' + translations.t('b) drinking water'),//6.2.ab
                    translations.t('b) target (min)') + ', ' + translations.t('c) sanitation'),//6.2.ab
                    translations.t('a) time series') + ', ' + translations.t('a) moving five-year average, referring to the middle year'),//2.1.a
                    translations.t('b) target (max)') + ', ' + translations.t('a) moving five-year average, referring to the middle year'),//2.1.a
                    translations.t('a) time series') + ', ' + translations.t('so2'),//3.2.a
                    translations.t('a) time series') + ', ' + translations.t('nox'),//3.2.a
                    translations.t('a) time series') + ', ' + translations.t('nh3'),//3.2.a
                    translations.t('a) time series') + ', ' + translations.t('nmvoc'),//3.2.a
                    translations.t('a) time series') + ', ' + translations.t('pm2.5'),//3.2.a
                    translations.t('a) time series') + ', ' + translations.t('a) sub-index forests'),//15.1.a
                    translations.t('a) time series') + ', ' + translations.t('c) sub-index farmland'),//15.1.a
                    translations.t('a) time series') + ', ' + translations.t('b) sub-index settlements'),//15.1.a
                    translations.t('a) time series') + ', ' + translations.t('d) sub-index inland waters'),//15.1.a
                    translations.t('a) time series') + ', ' + translations.t('e) sub-index coasts/seas'),
                    translations.t('b) target (min)') + ', ' + translations.t('f) index overall'),
                    translations.t('a) time series') + ', ' + translations.t('proportion of sustainable managed stocks in all msy examined stocks'),
                    translations.t('a) time series') + ', ' + translations.t('proportion of sustainable managed stocks in all msy examined stocks') + ', ' + translations.t('north sea'),
                    translations.t('a) time series') + ', ' + translations.t('proportion of sustainable managed stocks in all msy examined stocks') + ', ' + translations.t('baltic sea')];//14.1.b
                    // translations.t('a) time series') + ', ' + translations.t('sub-index forests'),//15.1.a,
                    // translations.t('a) time series') + ', ' + translations.t('sub-index farmland'),//15.1.a
                    // translations.t('a) time series') + ', ' + translations.t('sub-index settlements'),//15.1.a
                    // translations.t('a) time series') + ', ' + translations.t('sub-index inland waters'),//15.1.a
                    // translations.t('a) time series') + ', ' + translations.t('sub-index coasts/seas')];//15.1.a



      for (var i=0; i<bl.length; i++){
        exceptions.push(translations.t('a) time series') + ', ' + translations.t('a) total (moving four-year average)') + ', ' + translations.t(bl[i]));
      };


      getChartStyle = function (indicatorId, combinationDescription) {

        if (barCharts.indexOf(indicatorId) != -1) {
          if (exceptions.indexOf(combinationDescription) != -1){
            return 'line';
          }
          else{
            return 'bar';
          }
        }
        else {
          return 'line';
        }
      },
      //--#14.1 barsOnly---stop--------------------------------------------------------------------------------------------------------
      getOrder = function(combinationDescription) {
        if (exceptions.indexOf(combinationDescription) != -1){
          return 3;
        }
        else {
          return 1;
        }
      }

      getBorderDash = function(datasetIndex, combinationDescription) {
        // offset if there is no headline data:
        if(!this.hasHeadline) {
          datasetIndex += 1;
        }

        // 0 -
        // the first dataset is the headline:
        dashedLines = ['Ziel, Sanitärvers','Ziel, Trinkwasser',
                        'Ziel, Finanzierun','Ziel, Strukturell'
                        ,'Target, (a) Acces','Target, (b) Acces','Target, Access to',
                        'Target, Financial','Target, Structura',
                        ]

        return datasetIndex  > colors.length || dashedLines.indexOf(combinationDescription.substring(0, 17)) != -1 ? [5, 5] : undefined;
      },
      convertToDataset = function (data, combinationDescription, combination /*field, fieldValue*/) {
        // var fieldIndex = field ? _.findIndex(that.selectedFields, function (f) {
        //     return f === field;
        //   }) : undefined,

        //---#4 sameColorForTargetAndTimeSeries---start-----------------
        var categ = combinationDescription.substring(0, 4)
        if (categ == 'Ziel' || categ == 'Zeit' || categ == 'Targ' || categ == 'Time') {
          if (combinationDescription.indexOf(',') != -1){
            var sub = combinationDescription.substring(combinationDescription.indexOf(','), combinationDescription.length)
            if (nameList.indexOf(sub) == -1) {
              // Ziel oder Zeitreihe - Mit Disaggregationen - Pendant ist noch nicht aufgerufen worden
              // Schreibe den Index auf die Liste, damit dieser beim Aufruf des Pendants gefunden werden kann
              nameList.push(sub);
              indexList.push(datasetIndex);
              var datasetIndexMod = datasetIndex;
            }
            else {
              // Ziel oder Zeitreihe - Mit Disaggregationen - Pendant ist schon aufgerufen worden
              // --> finde den Index des Pendants
              var tempIndex = nameList.indexOf(sub);
              var datasetIndexMod = indexList[tempIndex];
            }
          }
          else {
            // Ziel oder Zeitreihe - Keine weiteren Disaggregationen
            // Nimm die erste farbe aus der Liste
            var datasetIndexMod = 0;
          }
        }
        else {
          // Keine Ziel-/Zeitreihen-Unterteilung
          // Nimm den normalen Indexwert
          var datasetIndexMod = datasetIndex;
        }
        //---#4 sameColorForTargetAndTimeSeries---stop------------------
        var fieldIndex,
          ds = _.extend({

            label: combinationDescription ? combinationDescription : that.country,
            disaggregation: combination,
            order: getOrder(combinationDescription),
            //---#13 noLineForTargets---start-------------------------------
            borderColor: getBorderColor(combinationDescription,datasetIndexMod,that.indicatorId),//'#' + getColor(datasetIndexMod),
            //borderColor: getLineStyle(combinationDescription, datasetIndexMod),
            //---#13 noLineForTargets---stop--------------------------------
            //---#4 sameColorForTargetAndTimeSeries---start-----------------
            //backgroundColor: '#' + getColor(datasetIndex),
            //backgroundColor: '#' + getColor(datasetIndexMod),
            backgroundColor: getBackground(combinationDescription,datasetIndexMod),
            //---#4 sameColorForTargetAndTimeSeries---stop------------------
            //---#11 setTargetPointstyle---start---------------------------------------
            pointStyle: getPointStyle(datasetIndex, combinationDescription),
            //---#11 setTargetPointstyle---stop----------------------------------------
            radius: getRadius(datasetIndex, combinationDescription), //6,
            pointRadius: getRadius(datasetIndex, combinationDescription),
            pointBorderColor: '#' + getColor(datasetIndexMod),
            borderDash: getBorderDash(datasetIndex, combinationDescription),

            data: _.map(that.years, function (year) {
              var found = _.findWhere(data, {
                Year: year
              });


              return found ? found.Value : null;
            }),


            // data: _.map(that.years, function(year, index) {
            //   return [year].concat(datasets.map(function(ds) {
            //     if (typeof ds.data[index] === 'undefined') {
            //       return null;
            //     }
            //     return ds.data[index];
            //   }));
            // }),


            //--#14 mixedCharts---start------------------------------------------------
            //type: getChartStyle(combinationDescription),
            //--#14 mixedCharts---stop-------------------------------------------------
            //--#14.1 barsOnly---start------------------------------------------------
            type: getChartStyle(that.indicatorId, combinationDescription),
            //--#14.1 barsOnly---stop-------------------------------------------------
            // options:{
            //     scales: {
            //         xAxes: [{
            //             stacked:  getStacked(that.indicatorId)
            //         }],
            //         yAxes: [{
            //             stacked: getStacked(that.indicatorId)
            //         }]
            //       }
            //     },
            // //stacked: getStacked(that.indicatorId),
            // stack: getStackGroup(that.indicatorId),
            borderWidth: combinationDescription ? 2 : 4
          }, that.datasetObject);
        console.log("DS: ",ds);
        datasetIndex++;
        return ds;
      };

    if (fields && !_.isArray(fields)) {
      fields = [].concat(fields);
    }

    var isSingleValueSelected = function() { return that.selectedFields.length === 1 && that.selectedFields[0].values.length === 1; },
        matchedData = that.data;

    // filter the data:
    //if(!isSingleValueSelected()) {
    if(that.selectedUnit) {
      matchedData = _.where(matchedData, { Units: that.selectedUnit});
    }

    matchedData = _.filter(matchedData, function(rowItem) {
      var matched = false;
      for(var fieldLoop = 0; fieldLoop < that.selectedFields.length; fieldLoop++) {
        if(that.selectedFields[fieldLoop].values.containsValue(rowItem[that.selectedFields[fieldLoop].field])) {
          matched = true;
          break;
        }
      }
      return matched;
    });

    var fieldSelectionInfo = [];

    this.onFieldsStatusUpdated.notify({
      data: this.fieldItemStates,
      selectionStates: fieldSelectionInfo
    });

    // get the headline data:
    var headline = this.getHeadline();

    // Catch the case where this is the initial display, there is a default
    // selected unit (the first one), there is a headline, and this headline
    // uses another unit.
    if (options.initial && headline.length && this.selectedUnit && this.selectedUnit != headline[0]['Units']) {
      // In this scenario we need to correct the selected unit here.
      this.selectedUnit = headline[0]['Units'];
    }

    // all units for headline data:
    if(headline.length) {
      headlineTable = {
        title: 'Headline data',
        headings: that.selectedUnit ? ['Year', 'Units', 'Value'] : ['Year', 'Value'],
        data: _.map(headline, function (d) {
          return that.selectedUnit ? [d.Year, d.Units, d.Value] : [d.Year, d.Value];
        })
      };
    }

    // headline plot should use the specific unit, if any,
    // but there may not be any headline data at all, or for the
    // specific unit:
    if(that.selectedUnit) {
      headline = _.where(headline, { Units : that.selectedUnit });
    }

    // only add to the datasets if there is any headline data:
    if(headline.length) {
      datasets.push(convertToDataset(headline));
    } else {
      this.hasHeadline = false;
    }

    // extract the possible combinations for the selected field values
    var combinations = this.getCombinationData(this.selectedFields);

    var filteredDatasets = [];
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    _.each(combinations, function(combination) {
      var filtered = _.filter(matchedData, function(dataItem) {
        var matched = true;
        for (var loop = 0; loop < that.selectableFields.length; loop++) {
          if (dataItem[that.selectableFields[loop]] !== combination[that.selectableFields[loop]])
            matched = false;
        }
        return matched;
      });

      if(filtered.length) {
        // but some combinations may not have any data:
        filteredDatasets.push({
          data: filtered,
          combinationDescription: getCombinationDescription(combination),
          combination: combination
        });
      }
    });

    var datasetCountExceedsMax = false;
    // restrict count if it exceeds the limit:
    if(filteredDatasets.length > maxDatasetCount) {
      datasetCountExceedsMax = true;
    }

    _.chain(filteredDatasets)
      .sortBy(function(ds) { return ds.combinationDescription; })
      .each(function(ds) { datasets.push(convertToDataset(ds.data, ds.combinationDescription, ds.combinations)); });

    // convert datasets to tables:
    var selectionsTable = {
      data: []
    };
    selectionsTable.headings = ['Year'].concat(_.pluck(datasets, 'label'));
    _.each(this.years, function(year, yearIndex) {
      selectionsTable.data.push([year].concat(_.map(datasets, function(ds) {
        return ds.data[yearIndex]
      })));
    });

    this.onDataComplete.notify({
      datasetCountExceedsMax: datasetCountExceedsMax,
      datasets: datasetCountExceedsMax ? datasets.slice(0, maxDatasetCount) : datasets,
      labels: this.years,
      headlineTable: headlineTable,
      selectionsTable: selectionsTable,
      indicatorId: this.indicatorId,
      shortIndicatorId: this.shortIndicatorId,
      selectedUnit: this.selectedUnit,
      footerFields: this.footerFields
    });

    if(options.initial || options.unitsChangeSeries) {

      if(options.initial) {
        // order the fields based on the edge data, if any:
        if(this.edgesData.length) {
          var orderedEdges = _.chain(this.edgesData)
            .groupBy('From')
            .map(function(value, key) { return [key].concat(_.pluck(value, 'To')); })
            .flatten()
            .value();

          var customOrder = orderedEdges.concat(_.difference(_.pluck(this.fieldItemStates, 'field'), orderedEdges));

          // now order the fields:
          this.fieldItemStates = _.sortBy(this.fieldItemStates, function(item) {
            return customOrder.indexOf(item.field);
          });
        }

        this.onUnitsComplete.notify({
          units: this.units,
          selectedUnit: this.selectedUnit
        });
      }

      // update the series:
      this.onSeriesComplete.notify({
        series: that.dataHasUnitSpecificFields ? _.filter(that.fieldItemStates, function(fis) {
          return _.findWhere(that.fieldsByUnit, { unit : that.selectedUnit }).fields.indexOf(fis.field) != -1;
        }) : this.fieldItemStates,
        allowedFields: this.allowedFields,
        edges: this.edgesData,
        hasGeoData: this.hasGeoData,
        geoData: this.geoData,
        geoCodeRegEx: this.geoCodeRegEx,
        showMap: this.showMap,
        //------------------------------------------------
        indicatorId: this.indicatorId,
        //------------------------------------------------

        //---#2.1 caseNoTimeSeriesInCsv---start-----------------------------------
        //---4.3.21: No content but map title in maps
        mapTitle: this.mapTitle,
        title: this.chartTitle,
        //---#2.1 caseNoTimeSeriesInCsv---stop------------------------------------

        //---#2.2 footerUnitInMapLegend---start-----------------------------------
        measurementUnit: this.measurementUnit,
        //---#2.2 footerUnitInMapLegend---stop------------------------------------
      });



    } else {
      this.onSeriesSelectedChanged.notify({
        series: this.selectedFields
      });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    if((options.initial || options.unitsChangeSeries) && !this.hasHeadline) {
      // if there is no initial data, select some:

      var minimumFieldSelections = {},
          forceUnit = false;
      // First, do we have some already pre-configured from data_start_values?
      if (this.startValues) {
        // We need to confirm that these values are valid, and pair them up
        // with disaggregation categories. The value, at this point, is a string
        // which we assume to be pipe-delimited.
        var valuesToLookFor = this.startValues.split('|');

        // Match up each field value with a field.
        _.each(this.fieldItemStates, function(fieldItem) {
          //--#21 allowMultipleStartValues---start-----------------------------
          minimumFieldSelections[fieldItem.field] = [];
          //--#21 allowMultipleStartValues---stop------------------------------
          _.each(fieldItem.values, function(fieldValue) {
            //console.log('C',fieldValue);
            if (_.contains(valuesToLookFor, fieldValue.value)) {
              //--#21 allowMultipleStartValues---start-----------------------------
              //minimumFieldSelections[fieldItem.field] = fieldValue.value;
              minimumFieldSelections[fieldItem.field].push(fieldValue.value);
              //--#21 allowMultipleStartValues---stop------------------------------
            }
          });
        });

      }
      if (_.size(minimumFieldSelections) == 0) {
        // If we did not have any pre-configured start values, we calculate them.
        // We have to decide what filters will be selected, and in some cases it
        // may need to be multiple filters. So we find the smallest row (meaning,
        // the row with the least number of disaggregations) and then sort it by
        // it's field values. This should have the affect of selecting the first
        // value in each drop-down, up until there are enough selected to display
        // data on the graph. First we get the number of fields:
        var fieldNames = _.pluck(this.fieldItemStates, 'field');
        // Manually add "Units" so that we can check for required units.
        fieldNames.push('Units');
        // We filter our full dataset to only those fields.
        var fieldData = _.map(this.data, function(item) { return _.pick(item, fieldNames); });
        // We then sort the data by each field. We go in reverse order so that the
        // first field will be highest "priority" in the sort.
        _.each(fieldNames.reverse(), function(fieldName) {
          fieldData = _.sortBy(fieldData, fieldName);
        });
        // But actually we want the top-priority sort to be the "size" of the
        // rows. In other words we want the row with the fewest number of fields.
        fieldData = _.sortBy(fieldData, function(item) { return _.size(item); });
        minimumFieldSelections = fieldData[0];
        // If we ended up finding something with "Units", we need to remove it
        // before continuing and then remember to force it later.
        if ('Units' in minimumFieldSelections) {
          forceUnit = minimumFieldSelections['Units'];
          delete minimumFieldSelections['Units'];
        }
      }

      // Ensure that we only force a unit on the initial load.
      if (!options.initial) {
        forceUnit = false;
      }

      // Now that we are all sorted, we notify the view that there is no headline,
      // and pass along the first row as the minimum field selections.
      this.onNoHeadlineData.notify({
        minimumFieldSelections: minimumFieldSelections,
        forceUnit: forceUnit
      });
    }
  };
};

indicatorModel.prototype = {
  initialise: function () {
    this.getData({
      initial: true
    });
  },
  getData: function () {
    this.getData();
  }
};
