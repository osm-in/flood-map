## Flood Maps
![](https://cloud.githubusercontent.com/assets/126868/11440554/86851886-9529-11e5-9bf5-55abcc223057.gif)

Interactive map to visualize and crowdsource flood related information using [OpenStreetMap](http://openstreetmap.in/#5/22.147/79.102) and [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/). Read more in [the](http://timesofindia.indiatimes.com/tech/apps/Bangalore-techies-build-app-to-help-Chennai-flood-victims/articleshow/50039041.cms) [press](http://www.thehindu.com/news/cities/chennai/crowdsourced-map-to-mark-inundated-areas/article7935008.ece)

### Flooded Streets Data
The flooded streets layer is contributed by the public. Contributions are anonymous with no version control for the sake of simplicity.

#### Data dump
You are encouraged to make use of the collected data for further analysis. Download the latest flooded streets layer as a geojson using [this Ajax request](https://github.com/osm-in/flood-map/blob/gh-pages/js/chennai.js#L145-L175).

- [11AM Dec 2, 2015](https://github.com/osm-in/flood-map/blob/gh-pages/data/chennai-flooded-streets-Dec2.geojson)

### Data Sources
- **Base Layer** - [OpenStreetMap](http://osm.org)
- **Vulnerable and Inundated Areas**
  - **Inundated areas (Nov 28)** [Flood Waters Over Chennai Area UNITAR - UNOSAT ](http://www.unitar.org/unosat/node/44/2312)
  - **Inundated areas (Dec 3)** [ISRO RISAT 1 ](https://www.mapbox.com/studio/data/maning.chennai_risat1/)
  - **Low lying locations**: [ISRO Cartodem3](http://bhuvan.nrsc.gov.in/data/download/index.php) and [SRTM 30m](http://earthexplorer.usgs.gov/)
- **Flood relief camp locations**: [Chennai Flood Relief Centres Crowdmapping](https://l.facebook.com/l.php?u=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1awkun_q3tk3W1YP5KvzKkFbXYraqHBB6BSK0AtJP2zI%2Fedit%3Fusp%3Dsharing&h=vAQFG6TRT)
- **Waterlogged Roads**: [The NEWSminute](http://www.thenewsminute.com/article/living-chennai-map-wire-shows-you-waterlogged-areas-36059)


#### Sources
- [HTML5 boilerplate](https://github.com/h5bp/html5-boilerplate)
- [Mapbox base.css](https://www.mapbox.com/base/)

#### Tools
* [Mapbox Studio](https://www.mapbox.com/studio)
* [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/)
* [Mapbox Dataset API](https://www.mapbox.com/api-documentation/#datasets)

#### Help us make a better map.

All of us believe in the open source ideology, and we would love your help in making the map data and source code better! Some ways in which you can contribute:
* Please take a look at our open issues, and submit PRs that can fix those issues. You can test the source code on your local machines, by
  * `npm install -g serve`
  * `serve -p 3001`
  * Running the map on your browser at `localhost:3001`
* If you have additional geospatial data related to the Chennai floods, please share them with us so we can add it as a layer to our base map. For example, relief centers, additional crowd-sourced data that could have valuable information etc. You can open an issue for the same in this repository.
