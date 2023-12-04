// Simple map
var SELECTED_ROADS_SOURCE;

mapboxgl.accessToken = PUBLIC_ACCESS_TOKEN;
var map = new mapboxgl.Map({
  container: 'map',
  style: STYLESHEET,
  hash: true
});

map.off('tile.error', map.onError);
map.addControl(new mapboxgl.Navigation());

map.on('style.load', function (e) {

  addSourcesAndLayers();

  getDataSet();

  map.on('click', function (e) {
    map.featuresAt(e.point, {
        radius: 10,
        layer: LOAD_INFO_LAYERS,
        includeGeometry: true
    }, loadInfo);
  });

  // Update map legend from styles
  $('[data-map-layer]').each(function () {
    // Get the color of the feature from the map
    var obj = $(this).attr('data-map-layer');

    try {
      var color = map.getPaintProperty(obj, 'circle-color');
      // Set the legend color
      $(this).prepend('<div class="map-legend-circle" style="background:"' + array2rgb(color) + '></div>');
    } catch (e) {
      return;
    }
  });
});

function getDataSet(startID) {
  $('#feature-count').toggleClass('loading');
  var url = DATASETS_BASE + 'features';

  var params = {
    'access_token': DATASETS_ACCESS_TOKEN
  };

  if (startID) params.start = startID;

  $.get(url, params, function (data) {
    var features = {
        type: 'FeatureCollection'
    };
    data.features.forEach(function (feature) {
        feature.properties.id = feature.id;
    });
    features.features = data.features;

    if (data.features.length > 0) {
      var lastFeatureID = data.features[data.features.length - 1].id;
      getDataSet(lastFeatureID);
    }

    SELECTED_ROADS_SOURCE.setData(features);

    updateFeatureCount(features);

    selectionHandler(features);
  });
  $('#feature-count').toggleClass('loading');
}

function deleteRoad(data, addedRoads, addedFeatures, features) {
  $('#map').toggleClass('loading');
  var url = DATASETS_BASE + 'features/' + features[0].properties.id + '?access_token=' + DATASETS_ACCESS_TOKEN;
  var index = addedRoads.indexOf(features[0].properties.id);
  $.ajax({
    method: 'DELETE',
    url: url,
    contentType: 'application/json',
    success: function () {
      $('#map').toggleClass('loading');
      data['features'].splice(index, 1);
      addedRoads.splice(index, 1);
      addedFeatures.splice(index, 1);
      SELECTED_ROADS_SOURCE.setData(data);
      updateFeatureCount(data);
    },
    error: function () {
      $('#map').toggleClass('loading');
    }
  });
}

function addRoad (data, addedRoads, addedFeatures, features) {
  $('#map').toggleClass('loading');
  var tempObj = {
    type: 'Feature',
    geometry: features[0].geometry,
    properties: features[0].properties,
  };
  tempObj.properties['is_flooded'] = true;
  tempObj.properties['timestamp'] = Date.now();
  tempObj.id = md5(JSON.stringify(tempObj));

  var url = DATASETS_BASE + 'features/' + tempObj.id + '?access_token=' + DATASETS_ACCESS_TOKEN;
  $.ajax({
    method: 'PUT',
    url: url,
    data: JSON.stringify(tempObj),
    dataType: 'json',
    contentType: 'application/json',
    success: function (response) {
      $('#map').toggleClass('loading');
      tempObj.id = response.id;
      tempObj.properties.id = response.id;
      addedFeatures.push(tempObj);
      data.features.push(tempObj);
      addedRoads.push(features[0].properties.osm_id);
      SELECTED_ROADS_SOURCE.setData(data);
      updateFeatureCount(data);
    },
    error: function () {
      $('#map').toggleClass('loading');
    }
  });
}

function addSourcesAndLayers() {
  $('#feature-count').toggleClass('loading');
  SELECTED_ROADS_SOURCE = new mapboxgl.GeoJSONSource({});
  map.addSource('selected-roads', SELECTED_ROADS_SOURCE);
  map.addLayer({
    'id': 'selected-roads',
    'type': 'line',
    'source': 'selected-roads',
    'interactive': true,
    'paint': {
      'line-color': 'rgba(255,5,230,1)',
      'line-width': 3,
      'line-opacity': 0.6
    }
  }, 'road-waterlogged');

  map.addSource('terrain-data', {
    type: 'vector',
    url: 'mapbox://mapbox.mapbox-terrain-v2'
  });
  map.addLayer({
    'id': 'terrain-data',
    'type': 'line',
    'source': 'terrain-data',
    'source-layer': 'contour',
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#ff69b4',
      'line-opacity': '0.3',
      'line-width': 1
    }
  });
  $('#feature-count').toggleClass('loading');
}

function selectionHandler(data) {
  var addedRoads = [];
  var addedFeatures = [];

  //Dump Data
  window.dump = JSON.stringify(data);

  data.features.forEach(function(feature) {
    addedRoads.push(feature.properties.id);
    addedFeatures.push(feature);
  });

  map.on('click', function (e) {
    if (map.getZoom() >= 15) {
      map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: 'selected-roads'}, function (err, features) {
        if (err) throw err;
        if (features.length) {
          deleteRoad(data, addedRoads, addedFeatures, features);
        } else {
          map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: MAP_LAYERS['road']}, function (err, features) {
            if (err) throw err;
            if (features.length) {
              addRoad(data, addedRoads, addedFeatures, features);
            }
          });
        }
      });
    }
  });
}

function loadInfo(err, features) {
  if (err) throw err;

  if (features.length > 0) {
    var popupHTML = '<h5>' + features[0].properties.Name + '</h5><p>' + $('[data-map-layer=' + features[0].layer.id + ']').html() + '</p>';

    var popup = new mapboxgl.Popup();

    popup
    .setLngLat(features[0].geometry.coordinates)
    .setHTML(popupHTML)
    .addTo(map);
  }
}

function updateFeatureCount(data) {
  $('#feature-count').toggleClass('loading');
  $('#feature-count').html(data.features.length);
  $('#feature-count').toggleClass('loading');
}

function array2rgb(color) {
  // Combine and return the values
  return 'rgba(' + color.map(function (x) {
    return x * 255;
  }).join() + ')';
}

$(function () {
  $('#sidebar').mCustomScrollbar({
    theme: 'rounded-dots',
    scrollInertia: 100,
    callbacks: {
      onInit: function () {
        $('#sidebar').css('overflow', 'auto');
      }
    }
  });
});
