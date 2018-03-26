
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
                mask: parseInt(item.mask),
                date: item.date
            };
        });
        loss.sort((a, b) => {
            return a.date > b.date ? 1: -1;
        });
        let trace1 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                if (item.mask == 0) 
                    return null;
                return item.origin
            }),
            name: "origin"
        };

        let trace2 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                if (item.mask == 0) 
                    return null;
                return item.predict
            }),
            name: "predict"
        };

        let trace3 = {
            x: loss.map((item) => {
                return item.date
            }),
            y: loss.map((item) => {
                if (item.mask == 0) 
                    return null;
                return item.loss
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

        let trace5 = {
            x: loss.map((item) => {
                return item.date
            }).slice(1),
            y: loss.map((item) => {
                return item.origin
            }),
            name: "previous origin"
        };

        let inputData = [trace1, trace2, trace3, trace4];

        let layout = {
            title: vdName + " start: " + startTime + " end: " + endTime,
            margin: {
                atuoexpand: false,
                l: 20,
                r: 20,
                t: 30,
                b: 20
            },
            // width = 500,
            height: screen.height,
            // height: parseInt(divHeight),
            showlegend: true,
            legend: { "orientation": "h" }
        };

        let config = {
            // displayModeBar: false,
            scrollZoom: true
        };
        Plotly.purge(divName);
        Plotly.newPlot(divName, inputData, layout, config);

        // let myDiv = document.getElementById(divName);
        // myDiv.on('plotly_click', (data) => {
        //     console.log(data);

        //     let points = data.points[0];
        //     let x = points.x,
        //         y = points.y;
        //     let trace = {
        //         x: [x],
        //         y: [y],
        //         mode: 'markers',
        //         name: 'mask',
        //         marker: {
        //             size: 10,
        //             color: 'black',
        //             opacity: 1
        //         },
        //         showlegend: false,
        //         hoverinfo: 'none'
        //     };
        //     Plotly.addTraces(divName, trace);
        // });

        // myDiv.on('plotly_selected', () => {
        //     console.log("XDDDD");
        // });

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
        
        for(let i = 0 ; i < data['z'].length; i++) {
            for(let j = 0; j<data['z'][i].length; j++){
                if (data['z'][i][j] >= 0.5)
                    data['z'][i][j] = 0.5;
            }
        }
        let zmax = Math.max(...data['z'].map((item) => {
            return Math.max(...item);
        }));
        console.log(zmax);
        let colorScale = [
            [0, '#000000'],
            [1e-10, '#0000FF']
        ];
        if (zmax >= 0.4) {
            colorScale.push(
                [0.2 / zmax, '#00FF00'],
                [0.4 / zmax, '#FF0000'],
                [1.0, '#FF0000']
            );
        }
        else if (zmax >= 0.2) {
            let dx = (zmax - 0.1) * 255;
            let R = dx;
            let G = 255 - dx;
            colorScale.push(
                [0.2 / zmax, '#00FF00'],
                [1.0, 'rgb(' + R + ', ' + G + ', 0)']
            );
        }
        else {
            let dx = (zmax - 0.1) * 255;
            let G = dx;
            let B = 255 - dx;
            colorScale.push(
                [1.0, 'rgb(0, ' + G + ', ' + B + ')']
            );
        }
        let inputData = [{
            z: data['z'],
            x: data['x'],
            y: data['y'],
            type: 'heatmap',
            colorscale: colorScale,
            colorbar: {
                title: 'rate = loss / mean',
                // thicknessmode: "pixels",
                // thickness: 10,
                lenmode: "pixels",
                len: 300,
                titleside: 'top',
                y: 0.99,
                // yanchor: "top",
                // tickmode: 'array',
                // nticks: 30,
                // cauto: false,
                // tickvals: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
                // ticktext: ["0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6"],
                ticks: 'outside',
                // showticklabels: false,
            }
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
                // atuoexpand: true,
                // l: screen.width * 0.05,
                // t: 50,
                // r: 50,
                // b: 45
            },
            height: parseInt(screen.height * 0.02 * 1000 ),
            width: parseInt((window.innerWidth || document.body.clientWidth ) * 0.95),
            showlegend: false,
            visible: false,
            legend: { "orientation": "h" }
        };

        let config = {
            // displayModeBar: false,
            scrollZoom: true
        };
        Plotly.purge(divName);
        Plotly.plot(divName, inputData, layout, config);
    });
}

function getD3Screamgraph(vdName, startTime, endTime, divName) {
    let datearray = [];
    let colorrange = [];
    let color = "";
    let query = {
        "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };
    console.log("!!!!!!!!!!");
    console.log(startTime);
    console.log(endTime);
    console.log(dayDiff(startTime, endTime));
    chart("data.csv", "orange");

    function chart(csvpath, color) {

        if (color == "blue") {
            colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
        } else if (color == "pink") {
            colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
        } else if (color == "orange") {
            colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
        }
        strokecolor = colorrange[0];

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
            .range([height / 2, 50]);
        let y2 = d3.scale.linear()
            .range([height - 50, height / 2]);

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
            .offset("zero")
            .values(function(d) { return d.values; })
            .x(function(d) { return d.date; })
            .y(function(d) { return d.value; });

        let nest = d3.nest()
            .key(function(d) { return d.key; });

        let area = d3.svg.area()
            .interpolate("basis")
            .x((d) => { return x(d.date); })
            .y0(y(0))
            .y1((d) => { return y(d.y); });

        let area2 = d3.svg.area()
            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            // .y(function(d) { return d.value; });
            .y0(function(d) { return y2(d.y0); })
            .y1(function(d) { return y2(d.y0 + d.y); });

        let svg = d3.select(".chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // let format = d3.time.format("%d/%m/%y");
        // let graph = d3.csv(csvpath, function(data) {
        let format = d3.time.format("%Y-%m-%d %H:%M");
        httpHelper.post(streamgraphpUrl, query, (data) => {
            console.log(data);
            for (let i in data) {
                data[i].date = format.parse(data[i].date);
                data[i].value = data[i].value;
            }

            let layers = stack(nest.entries(data));
            let layers2 = stack(nest.entries(
                data.map(({ value, ...rest }) => ({
                    value: -value,
                    ...rest,
                }))
            ));

            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
            y2.domain([d3.max(data, function(d) { return d.y0 + d.y; }), 0]);

            svg.selectAll(".layer")
                .data(layers)
                .enter().append("path")
                .attr("class", "layer")
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d, i) { return z(i); });

            svg.selectAll(".layer2")
                .data(layers)
                .enter().append("path")
                .attr("class", "layer")
                .attr("d", function(d) { return area2(d.values); })
                .style("fill", function(d, i) { return z(i); });

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
                .on("mouseover", function(d, i) {
                    svg.selectAll(".layer").transition()
                        .duration(250)
                        .attr("opacity", function(d, j) {
                            return j != i ? 0.6 : 1;
                        })
                })

            .on("mousemove", function(d, i) {
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
                .on("mouseout", function(d, i) {
                    svg.selectAll(".layer")
                        .transition()
                        .duration(250)
                        .attr("opacity", "1");
                    d3.select(this)
                        .classed("hover", false)
                        .attr("stroke-width", "0px"), tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "hidden");
                })

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
                .on("mousemove", function() {
                    mousex = d3.mouse(this);
                    mousex = mousex[0] + 5;
                    vertical.style("left", mousex + "px")
                })
                .on("mouseover", function() {
                    mousex = d3.mouse(this);
                    mousex = mousex[0] + 5;
                    vertical.style("left", mousex + "px")
                });

        });
    }
}


function myChart(vdName, startTime, endTime, divName) {
    let query = {
        "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };

    let margin = { top: 20, right: 40, bottom: 30, left: 30 };
    let width = document.body.clientWidth - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;

    let svg = d3.select(".chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // scale and axis
    let scaleX = d3.scaleTime()
        .range([0, width]);
    let scaleY = d3.scaleLinear()
        .range([height / 2, 0]);
    let scaleY2 = d3.scaleLinear()
        .range([0, height / 2]);

    let xAxis = d3.axisBottom(scaleX);
    let yAxis = d3.axisLeft(scaleY);
    let yAxis2 = d3.axisLeft(scaleY2);

    // line
    let line1 = d3.line()
        .x((d) => { return scaleX(d.date); })
        .y((d) => { return scaleY(d.origin); });
    // area
    let area1 = d3.area()
        .x((d) => { return scaleX(d.date); })
        .y0(height / 2)
        .y1((d) => { return scaleY(d.origin); });
    let area2 = d3.area()
        .x((d) => { return scaleX(d.date); })
        .y0(height / 2)
        .y1((d) => { return scaleY2(d.origin); });

    let format = d3.timeParse("%Y-%m-%d %H:%M");

    httpHelper.post(streamgraphpUrl, query, (data) => {
        for (let i in data) {
            data[i].date = format(data[i].date);
            // data[i].value = data[i].value;
        }
        let data2 = data.map(({ value, ...rest }) => ({
            value: -value,
            ...rest,
        }));

        scaleX.domain(d3.extent(data, (d) => { return d.date; }));
        scaleY.domain([0, d3.max(data, (d) => { return d.origin; })]);
        scaleY2.domain([d3.max(data, (d) => { return d.origin; }), 0]);
        // Add area
        svg.append("path")
            .data([data])
            .attr("class", "area")
            .attr("d", area1)
            .style("fill", "#74A9CF");
        svg.append("path")
            .data([data])
            .attr("class", "area")
            .attr("d", area2)
            .style("fill", "#045A8D");
        // Add line
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", line1)
            .style("fill", "none")
            .style("stroke", "#045A8D")
            .style("stroke-width", "2px");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // svg.append("g")
        //     .attr("class", "y axis")
        //     .call(yAxis);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis2);
    });
}