function dayDiff(a, b) {
    a = new Date(a);
    b = new Date(b);
    let timeDiff = Math.abs(b.getTime() - a.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

function timestamp2date(timestamp) {
    let date = new Date(timestamp);
    let monthArr = ["01", "02", "03", "04", "05", "06",
        "07", "08", "09", "10", "11", "12"
    ];
    let year = date.getFullYear();
    let month = monthArr[date.getMonth()];
    let day = ("0" + date.getDate()).substr(-2);
    let hour = date.getHours();
    let minute = date.getMinutes();
    return year + "-" + month + "-" + day + " " + hour + ":" + month;
}

function getLineChart(vdName, startTime, endTime, divName, divHeight, isMinute) {
    let query = {
        "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };
    console.log("!!!!!!!!!!");
    console.log(startTime);
    console.log(endTime);
    console.log(dayDiff(startTime, endTime));
    console.log(isMinute);

    let url = isMinute ? minuteUrl : dayUrl;
    httpHelper.post(url, query, (data) => {
        let loss = data.map((item) => {
            return {
                origin: JSON.parse(item.origin)[1],
                predict: JSON.parse(item.prediction)[1],
                loss: JSON.parse(item.loss)[1],
                mask: item.mask,
                date: item.date
            };
        });
        let trace1 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                return item.origin
            }),
            name: "origin"
        };
        let trace2 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                return item.predict
            }),
            name: "predict"
        };

        let trace3 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                return Math.sqrt(item.loss)
            }),
            name: "loss"
        };

        let trace4 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                return item.mask * 10
            }),
            name: "mask"
        };

        let inputData = [trace1, trace2, trace3, trace4];

        let layout = {
            title: vdName + " start: " + startTime + " end: " + endTime,
            margin: {
                atuoexpand: false,
                l: 20,
                r: 20,
                t: 30,
                b: 10
            },
            // width = 500,
            height: screen.height,
            // height: parseInt(divHeight),
            showlegend: true,
            legend: { "orientation": "h" }
        };

        let config = {
            displayModeBar: false,
            scrollZoom: true
        };
        Plotly.purge(divName);
        Plotly.newPlot(divName, inputData, layout, config);

        let myDiv = document.getElementById(divName);
        myDiv.on('plotly_click', (data) => {
            console.log(data);

            let points = data.points[0];
            let x = points.x,
                y = points.y;
            let trace = {
                x: [x],
                y: [y],
                mode: 'markers',
                name: 'mask',
                marker: {
                    size: 10,
                    color: 'black',
                    opacity: 1
                },
                showlegend: false,
                hoverinfo: 'none'
            };
            Plotly.addTraces(divName, trace);
        });

        myDiv.on('plotly_selected', () => {
            console.log("XDDDD");
        });

        // myDiv.on('plotly_relayout', (eventdata) => {
        //     if (eventdata['dragmode'] === undefined) {
        //         let update = {
        //             title: 'some new title', // updates the title
        //             'xaxis.range[0]': timestamp2date(eventdata['xaxis.range[0]']),
        //             'xaxis.range[1]': eventdata['xaxis.range[1]'],
        //             'yaxis.range[0]': eventdata['yaxis.range[0]'],
        //             'yaxis.range[1]': eventdata['yaxis.range[1]'],
        //         };
        //         let startTime = timestamp2date(eventdata['xaxis.range[0]']);
        //         let endTime = timestamp2date(eventdata['xaxis.range[1]']);
        //         if (startTime < "2015-01-01 01:05")
        //             startTime = "2015-01-01 01:05";
        //         if (endTime < "2015-01-02 01:10")
        //             endTime = "2015-01-02 01:10";
        //         if (endTime > "2017-01-01 00:00")
        //             endTime = "2017-01-01 00:00";
        //         if (dayDiff(endTime, startTime) < 6 && !isMinute) {
        //             Plotly.purge(divName);
        //             getLineChart(vdName, startTime, endTime, divName, divHeight, true);
        //         } else if (isMinute) {
        //             if (dayDiff(endTime, startTime) >= 6) {
        //                 Plotly.purge(divName);
        //                 getLineChart(vdName, startTime, endTime, divName, divHeight, false);
        //             }
        //         } else {
        //             Plotly.purge(divName);
        //             getLineChart(vdName, startTime, endTime, divName, divHeight, false);
        //         }
        //     }
        // });
    });
}

function getHeatMap(vdName, startTime, endTime, divName) {
    let query = {
        // "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };
    console.log("!!!!!!!!!!");
    console.log(startTime);
    console.log(endTime);
    console.log(dayDiff(startTime, endTime));
    // console.log(isMinute);
    // let url = isMinute ? minuteUrl : dayUrl;
    httpHelper.post(heatmapUrl, query, (data) => {

        let colorScale = [
            [0, '#000000'],
            [0.0001, '#0000FF'],
            [0.05, '#00FFFF'],
            [0.1, '#00FF00'],
            // [0.09, '#FFFF00'],
            [0.15, '#FF0000'],
            [1.0, '#FF0000']
        ];
        let inputData = [{
            z: data['z'],
            x: data['x'],
            y: data['y'],
            type: 'heatmap',
            colorscale: colorScale,

        }];
        // console.log(inputData);
        let layout = {
            xaxis: {
                ticks: '',
                side: 'top'
            },
            yaxis: {
                ticks: '',
                ticksuffix: ' ',
                // width: 700,
                // height: 700,
                autosize: true
            },
            title: " start: " + startTime + " end: " + endTime,
            margin: {
                atuoexpand: true,
                // l: screen.width * 0.05,
                t: 100,
                r: 10,
                b: 45
            },
            height: parseInt(screen.height * 5),
            showlegend: false,
            legend: { "orientation": "h" }
        };

        let config = {
            displayModeBar: false,
            scrollZoom: true
        };
        Plotly.purge(divName);
        Plotly.plot(divName, inputData, layout, config);
    });
}

function getD3HeatMap(vdName, startTime, endTime, divName) {
    let query = {
        "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };
    console.log("!!!!!!!!!!");
    console.log(startTime);
    console.log(endTime);
    console.log(dayDiff(startTime, endTime));
    // console.log(isMinute);
    // let url = isMinute ? minuteUrl : dayUrl;
    let itemSize = 950,
        cellSize = itemSize - 1,
        margin = { top: 20, right: 20, bottom: 20, left: 20 };

    let width = screen.width - margin.right - margin.left,
        height = screen.height - margin.top - margin.bottom;

    let formatDate = d3.time.format("%Y-%m-%d");

    httpHelper.post(dayUrl, query, (data) => {
        let loss = data.map((item) => {
            return {
                y: item.vd_name,
                z: JSON.parse(item.loss)[1],
                x: item.date
            }
        });

        let x_elements = d3.set(loss.map((item) => { return item.x; })).values().sort((a, b) => { return new Date(a) - new Date(b) });
        let y_elements = d3.set(loss.map((item) => { return item.y; })).values();

        console.log(x_elements);
        console.log(y_elements);

        let xScale = d3.scale.ordinal()
            .domain(x_elements)
            .rangeBands([0, x_elements.length]);

        let xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat((d) => {
                return d;
            })
            .orient("top");

        let yScale = d3.scale.ordinal()
            .domain(y_elements)
            .rangeBands([0, y_elements.length]);

        let yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat((d) => {
                return d;
            })
            .orient("left");

        let colorMin = loss.map((item) => { return item.z; }).reduce((item) => { return Math.min(item); });
        let colorMax = loss.map((item) => { return item.z; }).reduce((item) => { return Math.max(item); });
        let colorScale = d3.scale.threshold()
            .domain([colorMin, colorMax])
            .range(["#FF0000", "#0000FF"]);

        let svg = d3.select('.heatmap')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let cells = svg.selectAll('rect')
            .data(data)
            .enter().append('g').append('rect')
            .attr('class', 'cell')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('y', (d) => { return yScale(d.y); })
            .attr('x', (d) => { return xScale(d.x); })
            .attr('fill', (d) => { return colorScale(d.z); });

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll('text')
            .attr('font-weight', 'normal');

        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            .selectAll('text')
            .attr('font-weight', 'normal')
            .style("text-anchor", "start")
            .attr("dx", ".8em")
            .attr("dy", ".5em")
            .attr("transform", (d) => {
                return "rotate(-65)";
            });
    });
}

function getD3Screamgraph(vdName, startTime, endTime, divName) {
    let datearray = [];
    let colorrange = [];
    let color = "blue";

    let query = {
        "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };
    console.log("!!!!!!!!!!");
    console.log(startTime);
    console.log(endTime);
    console.log(dayDiff(startTime, endTime));

    let formatDate = d3.time.format("%Y-%m-%d");


    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    } else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    } else if (color == "orange") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    strokecolor = colorrange[0];

    let format = d3.time.format("%m/%d/%y");

    let margin = { top: 20, right: 40, bottom: 30, left: 30 };
    let width = document.body.clientWidth - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;

    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");

    let x = d3.time.scale()
        .range([0, width]);

    let y = d3.scale.linear()
        .range([height - 10, 0]);

    let z = d3.scale.ordinal()
        .range(colorrange);

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.weeks);

    let yAxis = d3.svg.axis()
        .scale(y);

    let yAxisr = d3.svg.axis()
        .scale(y);

    let stack = d3.layout.stack()
        .offset("silhouette")
        .values((d) => { return d.values; })
        .x((d) => { return d.date; })
        .y((d) => { return d.color; });

    let nest = d3.nest()
        .key((d) => { return d.key; });

    let area = d3.svg.area()
        .interpolate("cardinal")
        .x((d) => { return x(d.date); })
        .y0((d) => { return y(d.y0); })
        .y1((d) => { return y(d.y0 + d.y); });

    let svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    httpHelper.post(streamgraphpUrl, query, (data) => {

        // console.log(data);
        let layers = stack(nest.entries(data));

        x.domain(d3.extent(data, (d) => { console.log(d.date); return d.date; }));
        y.domain([0, d3.max(data, (d) => { console.log(d.y0 + d.y); return d.y0 + d.y; })]);

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", (d) => { return area(d.values); })
            .style("fill", (d, i) => { return z(i); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"));

        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", (d, i) => {
                svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", (d, j) => {
                        return j != i ? 0.6 : 1;
                    })
            })
            .on("mousemove", (d, i) => {
                mousex = d3.mouse(this);
                mousex = mousex[0];
                let invertedx = x.invert(mousex);
                invertedx = invertedx.getMonth() + invertedx.getDate();
                let selected = (d.values);
                for (let k = 0; k < selected.length; k++) {
                    datearray[k] = selected[k].date
                    datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
                }

                mousedate = datearray.indexOf(invertedx);
                pro = d.values[mousedate].value;

                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px"),
                    tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "visible");
            })
            .on("mouseout", (d, i) => {
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px"),
                    tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "hidden");
            });

        let vertical = d3.select(".chart")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", "380px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");

        d3.select(".chart")
            .on("mousemove", () => {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            })
            .on("mouseover", () => {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            });
    });
}