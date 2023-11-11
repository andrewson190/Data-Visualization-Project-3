var map = L.map('map').setView([42.7070, -71.1631], 13); // Coordinates for Lawrence, Massachusetts

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

var markers = [];

d3.csv("coordinates.csv").then(data =>{
    // Example points (markers) for Lawrence, Massachusetts
    var points = data.map(d => ({ 
        "name": d.SPECIES, 
        "latlng":[Number(d.LAT), Number(d.LONG)],
        "radius": +d.COUNT,
        "date": d.DATEPLANT,
        "diameter": d.DIAM,
        "treeheight": d.HEIGHT
    }));

    

    var colorScale = d3.scaleOrdinal()
    .range(d3.quantize(d3.interpolateRainbow, 90));

    var colors = data.map(d => ({
        "name": d.UNIQUE,
        "color": colorScale(+d.COLOR)
    }));
    
    var color = {};
    colors.forEach(d => {
        color[d.name] = d.color;
    });  
   
    points.forEach(function(point) {
        var popupContent = `<b>Name:</b> ${point.name}<br><b>Date:</b> ${point.date}<br><b>Tree Height:</b> ${point.treeheight}<br><b>Tree Diameter:</b> ${point.diameter}`;
        var marker = L.circle(point.latlng, {
            radius: (point.radius/1.5),
            weight: 1,
            color: color[point.name],
            fillColor: color[point.name], // Circle fill color
            fillOpacity: 0.5 
        }).addTo(map).bindPopup(popupContent);
        markers.push(marker); // Store the marker in the markers array
    });


    var checkboxes = document.getElementsByClassName("dateFilter");

    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("change", function(event) {
            var selectedDate = event.target.value; // Get the selected date from the checkbox

            markers.forEach(marker => {
                if (marker.getPopup().getContent().includes(selectedDate)) {
                    if (map.hasLayer(marker)) {
                        map.removeLayer(marker);
                    } else {
                        map.addLayer(marker);
                    }
                }
            });
        });
    }
});
