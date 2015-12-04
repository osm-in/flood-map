var DATASET_ID = 'cihoxpoqp0000vjkq160aw68g';
var DATASETS_BASE = 'https://api.mapbox.com/datasets/v1/chennaiflood/' + DATASET_ID + '/';
// var selectedRoadsSource;
var datasetsAccessToken = 'sk.eyJ1IjoiY2hlbm5haWZsb29kIiwiYSI6ImNpaG9mOGljdTBibmN0aGo3NWR6Y3Q0aXQifQ.X73YugnJDlhZEhxz2X86WA';

// Define map locations
var mapLocation = {
    'reset': {
        'center': [80.2, 13],
        'zoom': 11,
        'pitch': 0,
        'bearing': 0
    },
    'pallikaranai': {
        'center': [80.22, 12.926],
        'zoom': 13.8,
        'pitch': 45,
        'bearing': 90
    },
    'adyar-river': {
        'center': [80.261, 13.014],
        'zoom': 13.8,
        'pitch': 60,
        'bearing': -64,
        'highlight': 'water'
    },
    'cooum-river': {
        'center': [80.281, 13.074],
        'zoom': 13.8,
        'pitch': 60,
        'bearing': -64
    },
    'mudichur': {
        'center': [80.06, 12.91],
        'zoom': 13,
        'pitch': 50,
        'bearing': -10
    },
    'aminjikarai': {
        'center': [80.21, 13.07],
        'zoom': 13.8,
        'pitch': 50,
        'bearing': -10
    },
    'velachery': {
        'center': [80.21, 12.97],
        'zoom': 13.8,
        'pitch': 50,
        'bearing': -10
    },
    'omr': {
        'center': [80.23, 12.88],
        'zoom': 13,
        'pitch': 70,
        'bearing': -10
    }
};


// Simple map
mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/planemad/cih4qzr0w0012awltzvpie7qa', //stylesheet location
    hash: true
});
mapLocate('reset');

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.Navigation());

// Define a layer collection for easy styling
var mapLayerCollection = {
    'water': ['water', 'waterway-river-canal', 'waterway-small'],
    'road-bridges': ['bridge-main', 'bridge-street', 'bridge-trunk', 'bridge-motorway'],
    'cartodem': ['chennai-cartodem'],
    'buildings': ['building'],
    'road-subways': ['tunnel-motorway', 'tunnel-trunk', 'tunnel-main', 'tunnel-street'],
    'chennai-relief-camps': ['chennai-relief-camps'],
    'chennai-relief-camps-22nov': ['chennai-relief-camps-22nov'],
    'chennai-water-logged-points': ['chennai-water-logged-points'],
    'road': [
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
        'road-street_limited',
        'aeroway-runway',
        'aeroway-taxiway',
        'road-rail',
        'bridge-rail'
    ]
};

map.on('style.load', function (e) {

    var selectedRoadsSource = new mapboxgl.GeoJSONSource({});

    map.addSource('selected-roads', selectedRoadsSource);
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
            'line-opacity': '0.3',
            'line-width': 1
        }
    });

  // Select flooded roads
    var featuresGeoJSON = {
        'type': 'FeatureCollection',
        'features': []
    };
    $('#feature-count').toggleClass('loading');
    function getFeatures(startID) {
        var url = DATASETS_BASE + 'features';
        var params = {
            'access_token': datasetsAccessToken
        };
        if (startID) {
            params.start = startID;
        }
        $.getJSON(url, params, function (data) {
            if (data.features.length > 0) {
                data.features.forEach(function (feature) {
                    feature.properties.id = feature.id;
                });
                featuresGeoJSON.features = featuresGeoJSON.features.concat(data.features);
                var lastFeatureID = data.features[data.features.length - 1].id;
                getFeatures(lastFeatureID);
                selectedRoadsSource.setData(featuresGeoJSON);
                updateFeatureCount(featuresGeoJSON);
            } else {
              updateFeatureCount(featuresGeoJSON);
              $('#feature-count').toggleClass('loading');
                playWithMap(featuresGeoJSON);
            }
        });
    }

    getFeatures(null);

  //Live query
    map.on('mousemove', function (e) {
        map.featuresAt(e.point, {
            radius: 4
        }, function (err, features) {
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

  //Popups on click
    map.on('click', function (e) {
        map.featuresAt(e.point, {
            radius: 10,
            layer: ['chennai-relief-camps', 'chennai-relief-camps-22nov'],
            includeGeometry: true
        }, function (err, features) {
            if (err) throw err;

            if (features.length > 0) {
                var popupHTML = '<h5>' + features[0].properties.Name + '</h5><p>' + $('[data-map-layer=' + features[0].layer.id + ']').html() + '</p>';
                var popup = new mapboxgl.Popup()
                                        .setLngLat(features[0].geometry.coordinates)
                                        .setHTML(popupHTML)
                                        .addTo(map);
            }
        });
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

    function playWithMap(data) {
        var addedRoads = [];
        var addedFeatures = [];

        for (var i = 0; i < data.features.length; i++) {
            addedRoads.push(data.features[i].properties.id);
            addedFeatures.push(data.features[i]);
        }


        map.on('click', function (e) {
            if (map.getZoom() >= 15) {
                //Check if the feature clicked on is in the selected Roads Layer.
                //If yes, UNSELECT the road
                map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: 'selected-roads'}, function (err, features) {
                    if (err) throw err;

                    if (features.length > 0) {

                        $('#map').toggleClass('loading');
                        var saveURL = DATASETS_BASE + 'features/' + features[0].properties.id + '?access_token=' + datasetsAccessToken;

                        var index = addedRoads.indexOf(features[0].properties.id);
                        $.ajax({
                            'method': 'DELETE',
                            'url': saveURL,
                            'contentType': 'application/json',
                            'success': function () {
                                $('#map').toggleClass('loading');
                                data['features'].splice(index, 1);
                                addedRoads.splice(index, 1);
                                addedFeatures.splice(index, 1);
                                selectedRoadsSource.setData(data);
                                updateFeatureCount(data);
                            },
                            'error': function () {
                                $('#map').toggleClass('loading');
                            }
                        });
                    } else {
                        //If road is not present in the `selected-roads` layer,
                        //check the glFeatures layer to see if the road is present.
                        //If yes,ADD it to the `selected-roads` layer
                        map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: mapLayerCollection['road']}, function (err, glFeatures) {
                            if (err) throw err;

                            var tempObj = {
                                'type': 'Feature'
                            };

                            tempObj.geometry = glFeatures[0].geometry;
                            tempObj.properties = glFeatures[0].properties;
                            tempObj.properties['is_flooded'] = true;

                            $('#map').toggleClass('loading');

                            var id = md5(JSON.stringify(tempObj));
                            tempObj.id = id;
                            var saveURL = DATASETS_BASE + 'features/' + id + '?access_token=' + datasetsAccessToken;

                            $.ajax({
                                'method': 'PUT',
                                'url': saveURL,
                                'data': JSON.stringify(tempObj),
                                'dataType': 'json',
                                'contentType': 'application/json',
                                'success': function (response) {
                                    $('#map').toggleClass('loading');
                                    tempObj.id = response.id;
                                    tempObj.properties.id = response.id;
                                    addedFeatures.push(tempObj);
                                    data.features.push(tempObj);
                                    addedRoads.push(glFeatures[0].properties.osm_id);
                                    selectedRoadsSource.setData(data);
                                    updateFeatureCount(data);
                                },
                                'error': function () {
                                    $('#map').toggleClass('loading');
                                }
                            });
                        });
                    }
                });
            }
        });
    }
});
  //Update feature count
function updateFeatureCount(data) {
    var count = data.features.length;
    $('#feature-count').html(count);
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
