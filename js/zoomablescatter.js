


    d3.csv('data.csv', function (data) {

        console.log("data loaded")

        var margin = { top: 20, right: 20, bottom: 30, left: 30 };
        width = 900 - margin.left - margin.right,
            height = 480 - margin.top - margin.bottom;

        var colors = ["blue", "green", "red", "black"]
        var colorScale = d3.scaleOrdinal()
            .domain(["LEO", "MEO", "GEO", "Elliptical"])
            //.domain(function (d) {return d.ClassOfOrbit})
            .range(colors);

        var x = d3.scaleLinear()
            .domain([
                d3.min([0,d3.min(data,function (d) { return d.Inclination})]),
                d3.max([0,d3.max(data,function (d) { return d.Inclination})])
            ])
            .range([0, width])
            .nice();

        var y = d3.scaleLinear()
            .domain([
                d3.min([0,d3.min(data,function (d) { return d.ecc })]),
                d3.max([0,d3.max(data,function (d) { return d.ecc })])
            ])
            .range([height, 0]);


        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);



        var xAxis = d3.axisBottom(x).ticks(12),
            yAxis = d3.axisLeft(y).ticks(12 * height / width);

        var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
            idleTimeout,
            idleDelay = 350;

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);

        //var xExtent = d3.extent(data, function (d) { return d.x; });
        //var yExtent = d3.extent(data, function (d) { return d.y; });
        //x.domain(d3.extent(data, function (d) { return d.x; })).nice();
        //y.domain(d3.extent(data, function (d) { return d.y; })).nice();

        var scatter = svg.append("g")
            .attr("id", "scatterplot")
            .attr("clip-path", "url(#clip)");

        scatter.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 4)
            .attr("cx", function (d) { return x(d.Inclination); })
            .attr("cy", function (d) { return y(d.ecc); })
            .attr("opacity", 0.5)
            .style("fill", function (d) { return colorScale(d.ClassOfOrbit)})
            .on('mousedown', function () {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('r',6)
                    .attr('stroke-width',.5)
                    .attr('stroke', 'black')
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('r',4)

            })
            .append('title') // Tooltip
            .text(function (d) { return d.NameofSatellite +
                '\nEccentricity: ' + d.Eccentricity +
                '\nInclination: ' + d.Inclination +
                '\nClass of orbit: ' + d.ClassOfOrbit});

        // x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr('id', "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("text")
            .style("text-anchor", "end")
            .attr("x", width)
            .attr("y", height - 8)
            .text("Inclination");

        // y axis
        svg.append("g")
            .attr("class", "y axis")
            .attr('id', "axis--y")
            .call(yAxis);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .text("Eccentricity");

        scatter.append("g")
            .attr("class", "brush")
            .call(brush);

        function brushended() {

            var s = d3.event.selection;
            if (!s) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
                x.domain(d3.extent(data, function (d) { return d.Inclination; })).nice();
                y.domain(d3.extent(data, function (d) { return d.ecc; })).nice();
            } else {

                x.domain([s[0][0], s[1][0]].map(x.invert, x));
                y.domain([s[1][1], s[0][1]].map(y.invert, y));
                scatter.select(".brush").call(brush.move, null);
            }
            zoom();
        }

        function idled() {
            idleTimeout = null;
        }

        function zoom() {

            var t = scatter.transition().duration(750);
            svg.select("#axis--x").transition(t).call(xAxis);
            svg.select("#axis--y").transition(t).call(yAxis);
            scatter.selectAll("circle").transition(t)
                .attr("cx", function (d) { return x(d.Inclination); })
                .attr("cy", function (d) { return y(d.ecc); });
        }
    })
