ecodash = {};  // Our namespace.

var refLow = 2000;
var refHigh = 2010;
var studyLow = 2010 ;
var studyHigh = 2015;
var myValue = 3;
var checkbox = 0;
var CountryorProvince = 0

var drawingManager;

var Country = new google.maps.Data();
var Province = new google.maps.Data();
var CSS_COLOR_NAMES = ["Aqua","Black","Blue","BlueViolet","Brown","Aquamarine","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
var myName = [];
var DataArr = [];
var all_overlays = [];
var firstGraph = 0;
var myMap;

 /**
 * Starts the Surface Water Tool application. The main entry point for the app.
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 */
ecodash.boot = function(eeMapId, eeToken,serializedPolygonIds_country,serializedPolygonIds_province) {
	
	
	google.load('visualization', '1.0');

	var app = new ecodash.App(eeMapId, 
							  eeToken,JSON.parse(serializedPolygonIds_country),
							  JSON.parse(serializedPolygonIds_province));
};

// ---------------------------------------------------------------------------------- //
// The application
// ---------------------------------------------------------------------------------- //

/**
 * The main Surface Water Tool application.
 * @param {google.maps.ImageMapType} mapType The map type to render on the map.
 */
ecodash.App = function(eeMapId, eeToken,countryNames,provinceNames) {
  
  counter = 0;
  
  // Create and display the map.
  this.map = ecodash.App.createMap();
     
   // Initialize the UI components.
  this.initDatePicker();
  
  // set init slider
  this.initSlider(this.map);
  
  // add listenir 
  this.map.data.addListener('click', this.handlePolygonClick.bind(this));
  
  this.initButton(this.map,provinceNames,countryNames);
  
  this.opacitySliders();
  
  // Register a click handler to hide the panel when the user clicks close.
  $('.panel .clear').hide();
  $('.panel .updateMap').hide();

  $('.panel .clear').click(this.cleargraph.bind(this));
  
  myMap = this.map;
  $('.panel .updateMap').click(this.ShowMap.bind(this));
  
  
    // Load the default image.
  this.refreshImage(eeMapId, eeToken,countryNames,provinceNames);
};

/**
 * Creates a Google Map for the given map type rendered.
 * The map is anchored to the DOM element with the CSS class 'map'.
 * @param {google.maps.ImageMapType} mapType The map type to include on the map.
 * @return {google.maps.Map} A map instance with the map type rendered.
 */
ecodash.App.createMap = function() {
  var mapOptions = {
    center: ecodash.App.DEFAULT_CENTER,
    zoom: ecodash.App.DEFAULT_ZOOM,
	maxZoom: ecodash.App.MAX_ZOOM,
	//disableDefaultUI: true,
	streetViewControl: false
  };
  var mapEl = $('.map').get(0);
  var map = new google.maps.Map(mapEl, mapOptions);
  //map.overlayMapTypes.push(mapType);
  return map;
};

// ---------------------------------------------------------------------------------- //
// Layer management
// ---------------------------------------------------------------------------------- //

/** Updates the image based on the current control panel config. */
ecodash.App.prototype.refreshImage = function(eeMapId, eeToken) {
  var mapType = ecodash.App.getEeMapType(eeMapId, eeToken);
  this.map.overlayMapTypes.push(mapType);
};


/** Updates the image based on the current control panel config. */
ecodash.App.prototype.refresh = function(eeMapId, eeToken,map) {
  var mapType = ecodash.App.getEeMapType(eeMapId, eeToken);
  map.overlayMapTypes.push(mapType);
};

/**
 * Adds the polygons with the passed-in IDs to the map.
 * @param {Array<string>} polygonIds The IDs of the polygons to show on the map.
 *     For example ['poland', 'moldova'].
 */
ecodash.App.prototype.addPolygons = function(polygonIds) {

  polygonIds.forEach((function(polygonId) {
    this.map.data.loadGeoJson('static/province/' + polygonId + '.json');
	 }).bind(this));
  
  this.map.data.setStyle(function(feature) {
    return {
      fillColor: 'white',
      strokeColor: 'white',
      strokeWeight: 2
    };
  });

};

// ---------------------------------------------------------------------------------- //
// Date picker
// ---------------------------------------------------------------------------------- //

/** Initializes the date picker. */
ecodash.App.prototype.initDatePicker = function() {
  // Create the date pickers.
  $('.date-picker').datepicker({
    format: ' yyyy', // Notice the Extra space at the beginning
    viewMode: 'years',
    minViewMode: 'years',
    autoclose: true,
    startDate: new Date('2013'),
    endDate: new Date('2015')
  });

  // Set default date.
  $('.date-picker').datepicker('update', '2013');

  // Respond when the user updates the dates.
  $('.date-picker').change(this.refreshImage.bind(this));
};

ecodash.App.prototype.initSlider = function(map) {
  $("#reference").slider({ id: "slider12b", 
						   min: 2000, 
						   max: 2017, 
						   range: true, 
						   value: [2000, 2010] 
						   });
  
  $("#study").slider({ id: "slider12b", 
						 min: 2000, 
						 max: 2017, 
						 range: true, 
						 value: [2011, 2017] 
						 });


  $("#refTimeStart").text(refLow);
  $("#refTimeEnd").text(refHigh);
  
  $("#studyTimeStart").text(studyLow);
  $("#studyTimeEnd").text(studyHigh);
  
  
  $('#reference').slider().on('change', function(event) {
		refLow =  event.value.newValue[0];
		refHigh = event.value.oldValue[1];
   
		$("#refTimeStart").text(refLow);
		$("#refTimeEnd").text(refHigh);
	
		$('.panel .chart').empty(); 
		$('.panel .clear').hide();
		counter = 0;
		myName = []
		map.data.revertStyle();
		firstGraph = 0;
		DataArr = [];
		$('.panel .updateMap').show();
	

	
	for (var i=0; i < all_overlays.length; i++)
	 {
		all_overlays[i].overlay.setMap(null);
	}
	 all_overlays = [];
  
  }); 
  
  $('#study').slider().on('change', function(event) {
		studyLow =  event.value.newValue[0];
		studyHigh = event.value.oldValue[1];
   
		$("#studyTimeStart").text(studyLow);
		$("#studyTimeEnd").text(studyHigh);
		
		//put this in the function later
	    $('.panel .chart').empty(); 
		$('.panel .clear').hide();
		counter = 0;
		myName = []
		map.data.revertStyle();
		firstGraph = 0;
		DataArr = [];
		$('.panel .updateMap').show();

	
	for (var i=0; i < all_overlays.length; i++)
	 {
		all_overlays[i].overlay.setMap(null);
	}
	 all_overlays = [];

  });





}



ecodash.App.prototype.ShowProgress = function() {
    
    var pleaseWait = $('#pleaseWaitDialog'); 
    
    showPleaseWait = function() {
        pleaseWait.modal('show');
    };
        
    showPleaseWait();
}


ecodash.App.prototype.HideProgress = function() {
    
     var pleaseWait = $('#pleaseWaitDialog'); 
    
    hidePleaseWait = function () {
        pleaseWait.modal('hide');
    };
    
    hidePleaseWait();
}

ecodash.App.prototype.cleargraph = function() {

 
  $('.panel .chart').empty(); 
  $('.panel .clear').hide();
  counter = 0;
  myName = [];
  firstGraph = 0;
  DataArr = [];
  
  this.map.data.revertStyle();
  
   
};

ecodash.App.prototype.initButton = function(map,provinceNames,countryNames) {

	$("input[name='clickme']").change(function(){
	var myval = $("input[name='clickme']:checked").val();
	
	if (checkbox == 1){
		 map.data.forEach(function (feature) {
			 map.data.remove(feature);});
		 }
	
	if (myval == "1"){
	
	

	provinceNames.forEach((function(provinceName) {
	map.data.loadGeoJson('static/province/' +provinceName + '.json')}).bind());
		map.data.setStyle(function(feature) {
		return {
		  fillColor: 'white',
		  strokeColor: 'white',
		  strokeWeight: 2
			};
		  });
	checkbox = 1;
	CountryorProvince = 0;
	
	
	for (var i=0; i < all_overlays.length; i++)
	 {
		all_overlays[i].overlay.setMap(null);
	}
	
	all_overlays = [];

	if (drawingManager){
		drawingManager.setMap(null);
	}
	
		
	}
	
	
	if (myval == "2"){

	countryNames.forEach((function(countryName) {
	map.data.loadGeoJson('static/country/' + countryName + '.json')}).bind());
			
	map.data.setStyle(function(feature) {
	return {
	  fillColor: 'white',
	  strokeColor: 'white',
	  strokeWeight: 2
	 };
	});
	checkbox = 1;
	CountryorProvince = 1;
	
	
	for (var i=0; i < all_overlays.length; i++)
	 {
		all_overlays[i].overlay.setMap(null);
	}
	 all_overlays = [];
	
	if (drawingManager){
		drawingManager.setMap(null);
	}
	
	}
	
	if (myval == "3"){
	
	// Create a Google Maps Drawing Manager for drawing polygons.
		drawingManager = new google.maps.drawing.DrawingManager({
		  drawingMode: google.maps.drawing.OverlayType.POLYGON,
		  drawingControl: false,
		  polygonOptions: {
			fillColor: CSS_COLOR_NAMES[counter],
			strokeColor: CSS_COLOR_NAMES[counter]
		  }
		});

		// Respond when a new polygon is drawn.
		google.maps.event.addListener(drawingManager, 'overlaycomplete',
			function(event) {
			   
			   ecodash.App.prototype.ShowProgress();
			   all_overlays.push(event);
			   counter = counter + 1;
			   drawingManager.setOptions({
					polygonOptions: {
					fillColor: CSS_COLOR_NAMES[counter],
					strokeColor: CSS_COLOR_NAMES[counter]
				  }
				});
         
          var geom = event.overlay.getPath().getArray();
          
      
			$.get('/polygon?polygon=' + geom,{mycounter: counter,
											  refLow : refLow,									 
									          refHigh : refHigh,
									          studyLow : studyLow,
									          studyHigh : studyHigh	}).done((function(data) {    
				
			if (data['error']) {
				       alert("An error occured! Please refresh the page.");
			} 
			else {
		
				
				myName.push("my area " + counter.toString());
				ecodash.App.prototype.showChart(data);
				ecodash.App.prototype.HideProgress();
			}}).bind(this));
			
			

		
          
          
        });


        
     drawingManager.setMap(map);

 };

});

}


ecodash.App.prototype.ShowMap = function() {


	$('.panel .updateMap').hide();
	
	ecodash.App.prototype.ShowProgress();
	
	// clear the map
	myMap.overlayMapTypes.clear();
	var params = {};
	
	// set the parameters
	params['refLow'] = refLow
	params['refHigh'] = refHigh
	params['studyLow'] = studyLow
	params['studyHigh'] = studyHigh
	

	$.ajax({
      url: "/getmap",
	  data: params,
      dataType: "json",
      success: function (data) {
		 var mapType = ecodash.App.getEeMapType(data.eeMapId, data.eeToken);
		 myMap.overlayMapTypes.push(mapType);
		 ecodash.App.prototype.HideProgress();
		
      },
      error: function (data) {
        alert("An error occured! Please refresh the page.");
      }
    });	
	
	
}


/**
 * Shows a chart with the given timeseries.
 * @param {Array<Array<number>>} timeseries The timeseries data
 *     to plot in the chart.
 */
ecodash.App.prototype.showChart = function(timeseries) {


  $('.panel .clear').show();
  
  if (firstGraph == 0){
	timeseries.forEach(function(point) {
	point[0] = new Date(parseInt(point[0], 10));
	DataArr.push([point[0]]);
	firstGraph = 1
  });
  }
  var count = 0;
  timeseries.forEach(function(point) {
	  DataArr[count].push(point[1]);
	  count = count +1;
  });
  
  var data = new google.visualization.DataTable();
  data.addColumn('date');
  for (i = 0; i < counter; i++) { 
	data.addColumn('number', myName[i]);
  }
   
  data.addRows(DataArr);
  
  var wrapper = new google.visualization.ChartWrapper({
    chartType: 'LineChart',
    dataTable: data,
    options: {
	  width: 450,
      title: 'Biophyscial health',
      curveType: 'function',
      legend: {position: 'right'},
      titleTextStyle: {fontName: 'Roboto'},
      chartArea: {width: '40%'},
      colors: CSS_COLOR_NAMES
    }
  });
 
  $('.panel .chart').show();
  var chartEl = $('.chart').get(0);
  wrapper.setContainerId(chartEl);
  wrapper.draw();

};




/**
 * Handles a on click a polygon. Highlights the polygon and shows details about
 * it in a panel.
 * @param {Object} event The event object, which contains details about the
 *     polygon clicked.
 */

ecodash.App.prototype.handlePolygonClick = function(event) {
    
  //this.clear();
 
  this.ShowProgress();
  var feature = event.feature;
  
  
  
  // Instantly higlight the polygon and show the title of the polygon.
  this.map.data.overrideStyle(feature, {strokeWeight: 6,
										fillcolor: CSS_COLOR_NAMES[counter],
										strokeColor: CSS_COLOR_NAMES[counter]  	
											});
 
  document.getElementById("counter").value = counter;
  
  
  var title = feature.getProperty('title');
  myName.push(title);
 
   $('.panel').show();
   $('.title').show().text('title');
   $('.title').show().text(title);
	
	

  // Asynchronously load and show details about the polygon.
  var id = feature.getProperty('id');
   
  $.get('/details?polygon_id=' + id,{mycounter: counter,
									 folder : CountryorProvince,
									 refLow : refLow,									 
									 refHigh : refHigh,
									 studyLow : studyLow,
									 studyHigh : studyHigh									 
									 }).done((function(data) {    
    if (data['error']) {
      alert("An error! This is embarrassing! Please report to the sys admin. ");
    } else {
		
		this.showChart(data['timeSeries']);
		this.HideProgress();
    }
  }).bind(this));
  
  counter = counter + 1;
  
  
};


ecodash.App.prototype.opacitySliders = function() {

  // in case of merged permanent and flooded water layers:
  $("#ecoControl").on("slide", function(slideEvt) {
	ecodash.App.prototype.setLayerOpacity(slideEvt.value);
  });
  $("#ecoControl").on("slideStop", function(slideEvt) {
	ecodash.App.prototype.setLayerOpacity(slideEvt.value);
  });
}


ecodash.App.prototype.setLayerOpacity = function(value) {
  myMap.overlayMapTypes.forEach((function(mapType, index) {
    console.log(mapType.name)
    if (mapType) {
	  var overlay = myMap.overlayMapTypes.getAt(index);
      overlay.setOpacity(value);
    }
  }).bind(this));
};


// ---------------------------------------------------------------------------------- //
// Static helpers and constants
// ---------------------------------------------------------------------------------- //

/**
 * Generates a Google Maps map type (or layer) for the passed-in EE map id. See:
 * https://developers.google.com/maps/documentation/javascript/maptypes#ImageMapTypes
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 * @return {google.maps.ImageMapType} A Google Maps ImageMapType object for the
 *     EE map with the given ID and token.
 */
ecodash.App.getEeMapType = function(eeMapId, eeToken) {
  var eeMapOptions = {
    getTileUrl: function(tile, zoom) {
      var url = ecodash.App.EE_URL + '/map/';
      url += [eeMapId, zoom, tile.x, tile.y].join('/');
      url += '?token=' + eeToken;
      return url;
    },
    tileSize: new google.maps.Size(256, 256),
    name: 'ecomap',
	opacity: 1.0
  };
  return new google.maps.ImageMapType(eeMapOptions);
};

/**
 * Creates a drawing manager for the passed-in map.
 * @param {google.maps.Map} map The map for which to create a drawing
 *     manager.
 * @return {google.maps.drawing.DrawingManager} A drawing manager for
 *     the given map.
 */
ecodash.App.createDrawingManager = function(map) {
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: false,
    polygonOptions: {
      fillColor: '#ff0000',
      strokeColor: '#ff0000'
    }
  });
  drawingManager.setMap(map);
  return drawingManager;
};

/** @type {string} The Earth Engine API URL. */
ecodash.App.EE_URL = 'https://earthengine.googleapis.com';

/** @type {number} The default zoom level for the map. */
ecodash.App.DEFAULT_ZOOM = 5;

/** @type {number} The max allowed zoom level for the map. */
ecodash.App.MAX_ZOOM = 12;

/** @type {Object} The default center of the map. */
ecodash.App.DEFAULT_CENTER = {lng: 105.8, lat: 11.8};

/** @type {string} The default date format. */
ecodash.App.DATE_FORMAT = 'yyyy-mm-dd';
