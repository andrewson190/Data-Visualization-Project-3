var map = L.map('map').setView([42.7070, -71.1631], 13); // Coordinates for Lawrence, Massachusetts

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

var markers = [];

const svgWidth = 400;
const svgHeight = 300;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const svg = d3.select("#graph")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

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



    // Convert values to numbers
    data.forEach(d => {
        d.DIAM = +d.DIAM;
    });

    // Calculate the frequency of each number
    const counts = {};

    data.forEach(d => {
        const val = d.DIAM;
        counts[val] = counts[val] ? counts[val] + 1 : 1;
    });

    // Convert the counts object to an array of objects for D3
    const frequencyData = Object.keys(counts).map(key => ({
        value: +key,
        frequency: counts[key]
    }));

    // Define scales
    const x = d3.scaleBand()
        .domain(frequencyData.map(d => d.value))
        .range([margin.left, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(frequencyData, d => d.frequency)])
        .nice()
        .range([height, margin.top]);

    // Create bars
    svg.selectAll(".bar")
        .data(frequencyData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.value))
        .attr("y", d => y(d.frequency))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.frequency))
        .attr("fill", "steelblue");

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // x-axis label    
    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
        .style("text-anchor", "middle")
        .text("Tree Diameter");

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    // Function to filter data and update the bar chart
    function updateBarChart(selectedDate) {
        const filteredData = data.filter(d => d.DATEPLANT === selectedDate);
        markers.forEach(marker => {
            const popupContent = marker.getPopup().getContent();
            const isVisible = popupContent.includes(selectedDate);
    
            if (isVisible) {
                if (!map.hasLayer(marker)) {
                    map.addLayer(marker);
                }
            } else {
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            }
        });
        // Recalculate counts for the filtered data
        const filteredCounts = {};
        filteredData.forEach(d => {
            const val = d.DIAM;
            filteredCounts[val] = filteredCounts[val] ? filteredCounts[val] + 1 : 1;
        });

        // Convert the filtered counts object to an array of objects for D3
        const filteredFrequencyData = Object.keys(filteredCounts).map(key => ({
            value: +key,
            frequency: filteredCounts[key]
        }));

        // Update the domain of the y-axis based on the filtered data
        y.domain([0, d3.max(filteredFrequencyData, d => d.frequency)]).nice();

        // Remove existing bars
        svg.selectAll(".bar").remove();

        // Create new bars for the filtered data
        svg.selectAll(".bar")
            .data(filteredFrequencyData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.value))
            .attr("y", d => y(d.frequency))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.frequency))
            .attr("fill", "steelblue");

        // Update y-axis
        svg.select(".y-axis")
            .call(d3.axisLeft(y));
    }

    var checkboxes = document.getElementsByClassName("dateFilter");
    
    var selectedCheckbox = null;

    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener("change", function(event) {
            if (selectedCheckbox) {
                selectedCheckbox.checked = false; // Uncheck the previously selected checkbox
            }
            selectedCheckbox = event.target; // Set the newly selected checkbox
            var selectedDate = event.target.value; // Get the selected date from the checkbox
            updateBarChart(selectedDate);
            // Filter markers based on the selected date
            markers.forEach(marker => {
                if (marker.getPopup().getContent().includes(selectedDate)) {
                    if (map.hasLayer(marker)) {
                        map.removeLayer(marker);
                        updateBarChart(selectedDate);
                    } else {
                        map.addLayer(marker);
                        updateBarChart(selectedDate);
                    }
                }
            });
        });

        
    }
    

});
