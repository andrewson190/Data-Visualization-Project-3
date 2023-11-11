function Count() {
    var svg = d3.select("svg"),
    margin = 350,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

    var xScale = d3.scaleBand().range([0,width]).padding(0.4);
    var yScale = d3.scaleLinear().range([height,0]);

    var g = svg.append("g").attr("transform", "translate("+100+","+100+")");


    d3.csv("Count-Only.csv").then(data =>{
        console.log("-------->", data)
        xScale.domain(data.map(d => d.SPECIES));
        yScale.domain([0, 7500]);

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
            .attr("x", d => xScale(d.SPECIES))
            .attr("y", d => yScale(d.COUNT))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.COUNT))
    })  
}

