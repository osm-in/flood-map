## Flood Maps
Interactive map to visualize and crowdsource flood related information using [OpenStreetMap](http://openstreetmap.in/#5/22.147/79.102) and [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/). Read more in [the](http://timesofindia.indiatimes.com/tech/apps/Bangalore-techies-build-app-to-help-Chennai-flood-victims/articleshow/50039041.cms) [press](http://www.thehindu.com/news/cities/chennai/crowdsourced-map-to-mark-inundated-areas/article7935008.ece)

### Missing streets
If your street, building or neighborhood name is missing on the map, you can add it to the basemap directly by editing [OpenStreetMap](http://tasks.openstreetmap.in/project/62). The flood map will be updated with the new street in under 10 minutes.

### Flooded Streets Data
The flooded streets layer is contributed by the public. Contributions are anonymous with no version control for the sake of simplicity.

#### Data dump
You are encouraged to make use of the collected data for further analysis. Download the latest flooded streets layer as a geojson using [this Ajax request](https://github.com/osm-in/flood-map/blob/gh-pages/js/chennai.js#L145-L175).

- [11AM Dec 2](https://github.com/osm-in/flood-map/blob/gh-pages/data/chennai-flooded-streets-Dec2.geojson)


### Data Sources
- **Base Layer** - [OpenStreetMap](http://osm.org)

#### Sources
- [HTML5 boilerplate](https://github.com/h5bp/html5-boilerplate)
- [Mapbox base.css](https://www.mapbox.com/base/)
