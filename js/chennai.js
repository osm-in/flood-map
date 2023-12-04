// Simple map
let SELECTED_ROADS_SOURCE;

let user = {
  ip : null,
  location : null
}

mapboxgl.accessToken = PUBLIC_ACCESS_TOKEN;
var map = new mapboxgl.Map({
  container: 'map',
  style: STYLESHEET,
  hash: true
});

// Find user details to add to contributed data
fetch('https://cloudflare.com/cdn-cgi/trace')
.then(resp => resp.text())
.then(data => {

userIpMatch = data.match(/ip=([\d.]+)/);
userLocationMatch = data.match(/colo=([\d.]+)/);

user.location = userLocationMatch ? userLocationMatch[1] : null;
user.ip = userIpMatch ? userIpMatch[1] : null;

})

map.off('tile.error', map.onError);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Add geolocate control to the map.
map.addControl(
  new mapboxgl.GeolocateControl({
  positionOptions: {
  enableHighAccuracy: true
  },
  // When active the map will receive updates to the device's location as it changes.
  trackUserLocation: true,
  // Draw an arrow next to the location dot to indicate which direction the device is heading.
  showUserHeading: true
  })
  );

map.on('style.load', function (e) {

  addSourcesAndLayers();

  getDataSet();

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

function addRoad(data, addedRoads, addedFeatures, features) {
  $('#map').toggleClass('loading');
  var tempObj = {
    type: 'Feature',
    geometry: features[0].geometry,
    properties: features[0].properties,
  };
  tempObj.properties['is_flooded'] = true;
  tempObj.properties['timestamp'] = Date.now();
  tempObj.properties['ip'] = user.ip;
  tempObj.properties['location'] = user.location;
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


  map.addSource('selected-roads', {
    'type': 'geojson',
    'data': null
  });
  SELECTED_ROADS_SOURCE = map.getSource('selected-roads')

  map.addLayer({
    'id': 'selected-roads',
    'type': 'line',
    'source': 'selected-roads',
    'paint': {
      'line-color': 'rgba(255,5,230,1)',
      'line-width': 3,
      'line-opacity': 0.6
    }
  });

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
      'line-opacity': 0.3,
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

  data.features.forEach(function (feature) {
    addedRoads.push(feature.properties.id);
    addedFeatures.push(feature);
  });

  map.on('click', function (e) {
    if (map.getZoom() >= 15) {
      let features;
      features = map.queryRenderedFeatures(e.point, { layers: ['selected-roads'] })
      console.log(features)
      if (features.length) {
        deleteRoad(data, addedRoads, addedFeatures, features);
      } else {
        let features;
        features = map.queryRenderedFeatures(e.point, { layers: MAP_LAYERS['road'] });
        if (features.length) {
          console.log(features)
          addRoad(data, addedRoads, addedFeatures, features);
        }
      }
    }
  });
}

function updateFeatureCount(data) {
  $('#feature-count').toggleClass('loading');
  $('#feature-count').html(data.features.length);
  $('#feature-count').toggleClass('loading');
}

