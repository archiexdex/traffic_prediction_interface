function getChart(vdName, startTime, endTime, divName) {
    let query = {
        "vdName": vdName,
        "startTime": startTime,
        "endTime": endTime
    };

    // httpHelper.post(minuteUrl, query, (data) => {
    httpHelper.post(dayUrl, query, (data) => {
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

        Plotly.newPlot(divName, inputData, {
            margin: { t: 20 }
        });
    });
}


function test(vdName, startTime, endTime, divName) {
    var trace1 = {
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        type: 'scatter'
    };

    var trace2 = {
        x: [1, 2, 3, 4],
        y: [16, 5, 11, 9],
        type: 'scatter'
    };

    var data = [trace1, trace2];

    Plotly.newPlot(divName, data);
}