function Count() {
    

    

    d3.csv("coordinates.csv").then(data =>{
        var svg = d3.select("svg"),
        margin = 350,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

        var xScale = d3.scaleBand().domain(data.map(d => d.UNIQUE)).range([0,width]).padding(0.4);
        var yScale = d3.scaleLinear().domain([0, 7500]).range([height,0]);

        var g = svg.append("g").attr("transform", "translate("+100+","+100+")");

        g.append("g")
            .attr("class", "x-axis")
            .attr("clip-path", "url(#clip-path)")
            .attr('transform', 'translate(0, '+height+')' )
            .call(d3.axisBottom(xScale))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-70)");
    
        g.append("g").call(d3.axisLeft(yScale));

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.UNIQUE))
            .attr("y", d => yScale(d.TOTAL))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.TOTAL))
        
        var zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);

        svg.call(zoom);

        function zoomed(event) {
            const newXScale = event.transform.rescaleX(xScale);

            g.selectAll(".bar")
                .attr("x", d => newXScale(d.UNIQUE))
                .attr("width", newXScale.bandwidth());

            g.select(".x-axis")
                .call(d3.axisBottom(newXScale)
                    .tickFormat((d, i) => data[i].UNIQUE)
                );
        }

    })
}

