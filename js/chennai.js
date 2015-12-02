var API_BASE = 'http://chennai.makeamap.in/';
// Define map locations
var mapLocation = {
  "reset": {
    "center": [80.2, 13],
    "zoom": 11,
    "pitch": 20,
    "bearing": -30
  },
  "pallikaranai": {
    "center": [80.22, 12.926],
    "zoom": 13.8,
    "pitch": 45,
    "bearing": 90
  },
  "adyar-river": {
    "center": [80.261, 13.014],
    "zoom": 13.8,
    "pitch": 60,
    "bearing": -64,
    "highlight": "water"
  },
  "cooum-river": {
    "center": [80.281, 13.074],
    "zoom": 13.8,
    "pitch": 60,
    "bearing": -64
  },
  "mudichur": {
    "center": [80.06, 12.91],
    "zoom": 13,
    "pitch": 50,
    "bearing": -10
  },
  "aminjikarai": {
    "center": [80.21, 13.07],
    "zoom": 13.8,
    "pitch": 50,
    "bearing": -10
  },
  "velachery": {
    "center": [80.21, 12.97],
    "zoom": 13.8,
    "pitch": 50,
    "bearing": -10
  },
  "omr": {
    "center": [80.23, 12.88],
    "zoom": 13,
    "pitch": 70,
    "bearing": -10
  }
};


// Simple map
mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/planemad/cih4qzr0w0012awltzvpie7qa', //stylesheet location
  hash: true
});
mapLocate("reset");

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.Navigation());

// Define a layer collection for easy styling
var mapLayerCollection = {
  "water": ["water", "waterway-river-canal", "waterway-small"],
  "road-bridges": ["bridge-main", "bridge-street", "bridge-trunk", "bridge-motorway"],
  "cartodem": ["chennai-cartodem"],
  "buildings": ["building"],
  "road-subways": ["tunnel-motorway", "tunnel-trunk", "tunnel-main", "tunnel-street"],
  "chennai-relief-camps": ["chennai-relief-camps"],
  "chennai-relief-camps-22nov": ["chennai-relief-camps-22nov"],
  "chennai-water-logged-points": ["chennai-water-logged-points"],
  "road": [
  'road-main',
  'road-construction',
  'road-rail',
  'road-motorway',
  'road-trunk',
  'road-street',
  'road-service-driveway',
  'road-path',
  'tunnel-motorway',
  'tunnel-trunk',
  'tunnel-main',
  'tunnel-street',
  'bridge-main',
  'bridge-street',
  'bridge-trunk',
  'bridge-motorway',
  'road-street_limited'
  ]
};

map.on('style.load', function(e) {
  var chennaiGeoJSON;
  
  map.addSource('terrain-data', {
    type: 'vector',
    url: 'mapbox://mapbox.mapbox-terrain-v2'
  });

  map.addLayer({
    "id": "terrain-data",
    "type": "line",
    "source": "terrain-data",
    "source-layer": "contour",
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#ff69b4",
      "line-opacity": "0.3",
      "line-width": 1
    }
  });
  
  // Select flooded roads
  $('#map').toggleClass('loading');
  $.get(API_BASE + 'places.geojson', function(data, status) {
    chennaiGeoJSON = JSON.parse(data);
    updateFeatureCount(chennaiGeoJSON);
    playWithMap(chennaiGeoJSON);
    $('#map').toggleClass('loading');
  })
  .fail(function() {
    alert('We might be facing server issues due to high traffic.  If this continues please report here: \nhttps://github.com/osm-in/flood-map/issues/');
  });

  //Live query
  map.on('mousemove', function(e) {
    map.featuresAt(e.point, {
      radius: 4
    }, function(err, features) {
      if (err) throw err;

      var featuresList = '';
      if (features[0]) {
        if (features[0].properties.class)
          featuresList += features[0].properties.class + ' ';
        if (features[0].properties.type)
          featuresList += features[0].properties.type + '';
        if (features[0].properties.name)
          featuresList += '- ' + features[0].properties.name;
        $('#map-query').html(featuresList);
      }
    });
  });

  // Popups on click
  map.on('click', function(e) {
    map.featuresAt(e.point, {
      radius: 10,
      layer: ['chennai-relief-camps', 'chennai-relief-camps-22nov'],
      includeGeometry: true
    }, function(err, features) {
      if (err) throw err;

      if (features.length > 0) {
        var popupHTML = "<h5>" + features[0].properties.Name + "</h5><p>" + $("[data-map-layer=" + features[0].layer.id + "]").html() + "</p>";
        var popup = new mapboxgl.Popup()
        .setLngLat(features[0].geometry.coordinates)
        .setHTML(popupHTML)
        .addTo(map);
      }
    });
  });

  // Update map legend from styles
  $("[data-map-layer]").each(function(e) {

    // Get the color of the feature from the map
    var obj = $(this).attr('data-map-layer');

    try {
      var color = map.getPaintProperty(obj, 'circle-color');
      // Set the legend color
      $(this).prepend('<div class="map-legend-circle" style="background:' + array2rgb(color) + '"></div>');
    } catch (e) {
      return;
    }
  });

  function playWithMap(data) {
    var addedRoads = [];
    var addedFeatures = [];
    var deletedRoads = [];

    for (var i = 0; i < data.features.length; i++) {
      addedRoads.push(data.features[i].properties.osm_id);
      addedFeatures.push(data.features[i]);
    }

    var selectedRoadsSource = new mapboxgl.GeoJSONSource({
      'data': data
    });

    map.addSource('selected-roads', selectedRoadsSource);
    map.addLayer({
      'id': 'selected-roads',
      'type': 'line',
      'source': 'selected-roads',
      'paint': {
        'line-color': 'rgba(255,5,230,1)',
        'line-width': 10,
        'line-opacity': 0.3
      }
    });

    // Toggle way selection on click
    map.on('click', function(e) {
      if (map.getZoom() >= 15) {
        map.featuresAt(e.point, {
          radius: 5,
          includeGeometry: true,
          layer: mapLayerCollection["road"]
        }, function(err, features) {
          if (err) throw err;

          for (var i = 0; i < features.length; i++) {
            var tempObj = {};
            var index = addedRoads.indexOf(features[i].properties.osm_id);

            if (index !== -1 && addedFeatures[index] && (addedFeatures[index].geometry.coordinates.length === features[i].geometry.coordinates.length)) {

              //Create temp object
              tempObj.geometry = features[i].geometry;
              tempObj.properties = features[i].properties;
              tempObj.properties["is_flooded"] = false;

              $('#map').toggleClass('loading');
              $.post(API_BASE + "save", {
                'data': JSON.stringify(tempObj)
              }, function(data, status) {
                $('#map').toggleClass('loading');
              })
              .fail(function() {
                alert("Oops! Our server is out for a walk, try again after some time.");
              })
              .success(function() {
                  //Remove from all arrays
                  data['features'].splice(index, 1);
                  addedRoads.splice(index, 1);
                  addedFeatures.splice(index, 1);
                  selectedRoadsSource.setData(data);
                  updateFeatureCount(data);
                });
              break;

            } else if (features[i].layer['type'] === 'line' && (features[i].geometry['type'] === 'LineString' ||
              features[i].geometry['type'] === 'MultiLineString')) {

              //Create temp object
              tempObj.geometry = features[i].geometry;
              tempObj.properties = features[i].properties;
              tempObj.properties["is_flooded"] = true;
              
              $('#map').toggleClass('loading');
              $.post(API_BASE + "save", {
                'data': JSON.stringify(tempObj)
              }, function(data, status) {
                $('#map').toggleClass('loading');
              })
              .fail(function() {
                alert("Oops! Our server is out for a walk, try again after some time.");
              })
              .success(function() {
                  //Push to all arrays
                  addedFeatures.push(tempObj);
                  data.features.push(tempObj);
                  addedRoads.push(features[i].properties.osm_id);
                  selectedRoadsSource.setData(data);
                  updateFeatureCount(data);
                });
              break;
            }
          }
        });
    }
  });
  }
  //Update feature count
  function updateFeatureCount(data) {
    var count = data.features.length;
    $("#feature-count").html(count);
  }
});



function array2rgb(color) {
  // Combine and return the values
  return 'rgba(' + color.map(function(x) {
    return x * 255;
  }).join() + ')';
}

$(function() {
  $("#sidebar").mCustomScrollbar({
    theme:"rounded-dots",
    scrollInertia: 100,
    callbacks: {
      onInit: function() {
        $("#sidebar").css("overflow", "auto");
      }
    }
  });
});