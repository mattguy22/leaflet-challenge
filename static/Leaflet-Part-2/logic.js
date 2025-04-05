
// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let grayscale = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors, HOT"
});

// Satellite tile layer using Esri World Imagery
let satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles © Esri"
});

let outdoors = L.tileLayer("https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=YOUR_API_KEY", {
  attribution: "© Thunderforest, OpenStreetMap contributors"
});

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

let baseMaps = {
  "Grayscale": grayscale,
  "Satellite": satellite,
  "Outdoors": outdoors
};

let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  layers: [satellite, earthquakes, tectonicPlates]
});

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function getColor(depth) {
    return depth > 90 ? "#ea2c2c" :
           depth > 70 ? "#ea822c" :
           depth > 50 ? "#ee9c00" :
           depth > 30 ? "#eecc00" :
           depth > 10 ? "#d4ee00" :
                        "#98ee00";
  }

  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 4;
  }

  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `Magnitude: ${feature.properties.mag}<br>` +
        `Location: ${feature.properties.place}<br>` +
        `Depth: ${feature.geometry.coordinates[2]} km`
      );
    }
  }).addTo(earthquakes);

  let legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    div.style.backgroundColor = "white";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";
    div.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    div.style.lineHeight = "18px";
    div.style.fontSize = "14px";

    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<div style="margin-bottom:4px;">
          <i style="background:${colors[i]}; width:18px; height:18px; display:inline-block; margin-right:8px;"></i>
          ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + " km" : "+ km"}
        </div>`;
    }

    return div;
  };

  legend.addTo(map);
});

// OPTIONAL: Step 2
// Make a request to get our Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
  L.geoJson(plate_data, {
    style: {
      color: "orange",
      weight: 2
    }
  }).addTo(tectonicPlates);
  tectonicPlates.addTo(map);
});