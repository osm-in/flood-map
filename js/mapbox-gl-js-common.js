// Common map functions for Mapbox GL JS

var defaultStyle = {};

// Highlight a layer collection
function mapHighlight(item) {
  var layer = $(item).attr('data-map-layer');
  var color = $(item).attr('data-map-layer-highlight');

  // Loop through collection and store defaults before changing them
  MAP_LAYERS[layer].forEach(function(mapLayer) {
    var propObj = {};
    var prop;
    switch(map.getLayer(mapLayer).type) {
      case 'raster':
        prop = 'raster-opacity';
        break;
      case 'fill':
        prop = 'fill-color';
        break;
      case 'line':
        prop = 'line-color';
        break;
      case 'circle':
        prop = 'circle-color';
        break;
    }
    propObj[prop] = map.getPaintProperty(mapLayer, prop);

    defaultStyle[mapLayer] = propObj;
    map.setPaintProperty(mapLayer, prop, color);

  });

};

// Reset style of a collection to default
function mapHighlightReset() {
  for (var layer in MAP_LAYERS) {
    // Loop through collection and and reset properties to stored defaults
    MAP_LAYERS[layer].forEach(function (mapLayer) {
      var prop;
      switch(map.getLayer(mapLayer).type) {
        case 'fill':
          prop = 'fill-color';
          break;
        case 'line':
          prop = 'line-color';
          break;
        case 'circle':
          prop = 'circle-color';
          break;
      }

      // Revert to default style if known
      try {
        if (defaultStyle[mapLayer][prop])
          map.setPaintProperty(mapLayer, prop, defaultStyle[mapLayer][prop]);
      } catch(e){}

    });
  }

};

// Toggle visibility of a layer collection using opacity
function mapToggle(item) {
  var layer = $(item).attr('data-map-layer');

  // Loop through collection and toggle visibility
  MAP_LAYERS[layer].forEach(function(mapLayer) {
    var prop;
    switch(map.getLayer(mapLayer).type) {
      case 'raster':
        prop = 'raster-opacity';
        break;
      case 'fill':
        prop = 'fill-opacity';
        break;
      case 'line':
        prop = 'line-opacity';
        break;
      case 'circle':
        prop = 'circle-opacity';
        break;
    }
    try {
      map.setPaintProperty(mapLayer, prop, !map.getPaintProperty(mapLayer, prop));
    } catch (e) {
      map.setPaintProperty(mapLayer, prop, 0);
    }

  });

};

//Location functions
// Set pitch and fly to location
function mapLocate(location) {
  map.setPitch(MAP_LOCATIONS[location].pitch);
  map.flyTo(MAP_LOCATIONS[location]);
}
