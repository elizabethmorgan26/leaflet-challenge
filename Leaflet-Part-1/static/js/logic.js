// Define constants
const URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
const RADIUS_MIN = 5;
const RADIUS_COEF = 5;
const COLOR_DEPTHS = [10, 30, 50, 70, 90];

// Create the map object
let myMap = L.map("map", {
    center: [38, -98],
    zoom: 5
});

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Define function to get radius based on earthquake magnitude
function getRadius(feature) {
    return Math.max(feature.properties.mag * RADIUS_COEF, RADIUS_MIN);
}

// Define function to get color based on earthquake depth
function getColor(depth) {
    if (depth < COLOR_DEPTHS[0]) {
        return "#00ff00";
    } else if (depth < COLOR_DEPTHS[1]) {
        return "#c3f948";
    } else if (depth < COLOR_DEPTHS[2]) {
        return "#f9e448";
    } else if (depth < COLOR_DEPTHS[3]) {
        return "#f9aa48";
    } else if (depth < COLOR_DEPTHS[4]) {
        return "#eb6505";
    } else {
        return "#eb051f";
    }
}

// Define function to create earthquake markers
function createEarthquakeMarkers(data) {
    let earthquakes = [];

    data.features.forEach(feature => {
        let magnitude = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];
        let latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

        // Create circle marker with appropriate options
        let circleMarkerOptions = {
            radius: getRadius(feature),
            fillColor: getColor(depth),
            color: "black",
            opacity: 1,
            fillOpacity: 0.6,
            weight: 1
        };
        let circle = L.circleMarker(latlng, circleMarkerOptions);

        // Construct popup HTML
        let dt = new Date(feature.properties.time);
        let popupHTML = `
            <h2>${feature.properties.place}</h2>
            <hr>
            <p>Magnitude: ${magnitude}</p>
            <p>Depth: ${depth}km</p>
            <p>Time: ${dt}</p>
        `;
        circle.bindPopup(popupHTML);

        // Add circle marker to earthquakes array
        earthquakes.push(circle);
    });

    // Create a layer group from the array of markers
    let earthquakeLayer = L.layerGroup(earthquakes);

    // Add the earthquake layer to the map
    earthquakeLayer.addTo(myMap);

    // Create legend and add to the map
    createLegend();
}

// Perform API call to fetch earthquake data
d3.json(URL)
    .then(createEarthquakeMarkers)
    .catch(error => console.error("Error fetching earthquake data:", error));

// Function to create legend
function createLegend() {
    // Create legend control object
    let legend = L.control({ position: 'bottomright' });

    // Function to add legend to map
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += '<h4>Depth</h4>';

        // Loop through depth intervals and generate legend items
        COLOR_DEPTHS.forEach((depth, index) => {
            div.innerHTML += `
                <div>
                    <i style="background:${getColor(depth + 1)}"></i> 
                    ${depth} ${COLOR_DEPTHS[index + 1] ? '&ndash;' + COLOR_DEPTHS[index + 1] + 'km' : '+'}
                </div>`;
        });

        return div;
    };

    // Add legend to map
    legend.addTo(myMap);
}
