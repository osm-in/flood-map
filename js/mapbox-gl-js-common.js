// Common map functions for Mapbox GL JS

var defaultStyle = {};

// Highlight a layer collection
function mapHighlight(item) {

  var collectionName = $(item).attr('data-map-layer');
  var color = $(item).attr('data-map-layer-highlight');

  // Loop through collection and store defaults before changing them
  for (var i = 0; i < mapLayerCollection[collectionName].length; i++) {

    var obj = mapLayerCollection[collectionName][i];

    // Choose an appropriate property to change
    if (map.getLayer(obj).type == 'raster')
      prop = 'raster-opacity';
    if (map.getLayer(obj).type == 'fill')
      prop = 'fill-color';
    if (map.getLayer(obj).type == 'line')
      prop = 'line-color';
    if (map.getLayer(obj).type == 'circle')
      prop = 'circle-color';

    var propObj = {};
    propObj[prop] = map.getPaintProperty(obj, prop);

    defaultStyle[obj] = propObj;
    map.setPaintProperty(obj, prop, color);

  }

};

// Reset style of a collection to default
function mapHighlightReset(item) {

  var collectionName = $(item).attr('data-map-layer');

  for (var collectionName in mapLayerCollection) {
    // Loop through collection and and reset properties to stored defaults
    for (var i = 0; i < mapLayerCollection[collectionName].length; i++) {

      var obj = mapLayerCollection[collectionName][i];
      var prop;

      // Choose an appropriate property to change
      if (map.getLayer(obj).type == 'raster')
        prop = 'raster-opacity';
      if (map.getLayer(obj).type == 'fill')
        prop = 'fill-color';
      if (map.getLayer(obj).type == 'line')
        prop = 'line-color';
      if (map.getLayer(obj).type == 'circle')
        prop = 'circle-color';

      // Revert to default style if known
      if (defaultStyle[obj][prop])
        map.setPaintProperty(obj, prop, defaultStyle[obj][prop]);

    }
  }

};

// Toggle visibility of a layer collection using opacity
function mapToggle(item) {

  var collectionName = $(item).attr('data-map-layer');

  // Loop through collection and toggle visibility
  for (var i = 0; i < mapLayerCollection[collectionName].length; i++) {

    var obj = mapLayerCollection[collectionName][i];
    var prop;

    // Choose an appropriate property to change
    if (map.getLayer(obj).type == 'raster')
      prop = 'raster-opacity';
    if (map.getLayer(obj).type == 'fill')
      prop = 'fill-opacity';
    if (map.getLayer(obj).type == 'line')
      prop = 'line-opacity';
    if (map.getLayer(obj).type == 'circle')
      prop = 'circle-opacity';
    try {
      map.setPaintProperty(obj, prop, !map.getPaintProperty(obj, prop));
    } catch (e) {
      map.setPaintProperty(obj, prop, 0);
    }

  }

};

//Location functions
// Set pitch and fly to location
function mapLocate(location) {
  map.setPitch(mapLocation[location].pitch);
  map.flyTo(mapLocation[location]);
}

// Live map query
map.on('style.load', function(e) {
  map.on('mousemove', function(e) {
    map.featuresAt(e.point, {
      radius: 4
    }, function(err, features) {
      if (err) throw err;
      var featuresList = '';
      var feature = '';
      for (var i = 0; i < 1; i++) {
        if (features[i].properties.class)
          featuresList += features[i].properties.class + ' ';
        if (features[i].properties.type)
          featuresList += features[i].properties.type + ' ';
        if (features[i].properties.name)
          featuresList += ':' + features[i].properties.name;
      }
      $('#map-query').attr('value', featuresList);
    });
  });
});
