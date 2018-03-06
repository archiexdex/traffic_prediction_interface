let markerDict = {};
let beginTime, endTime;
// window width and height 
const window_width = parseInt(window.getComputedStyle(document.getElementsByTagName('body')[0], null).getPropertyValue("width"), 10);
const window_height = parseInt(window.getComputedStyle(document.getElementsByTagName('body')[0], null).getPropertyValue("height"), 10)
let map, map_main, map_slider, map_time, map_marker, map_location;
// the number icon address
let icon = 'images/';
let map_chart = [];

//save the goolemap UI location information 
let location_info = {
    construct: () => {
        var location = {};
        location.set = [];
        location.occupy = [];
        location.release = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        location.set.push(google.maps.ControlPosition.LEFT_TOP);
        return location;
    }
}

// set the initial googlemap data ( center , location )
let initial_map = {
    construct: () => {
        var map = {};
        map.center = { lat: 25.053031, lng: 121.54882 };
        map.location = location_info.construct();
        return map;
    }
}

// slider input 
let control_slider = {
    construct: () => {
        var slider = {};
        slider.div = document.createElement('div');
        slider.set = function() {
            var controlUI = document.createElement('div');
            controlUI.id = 'slider'; // only add a id 
            slider.div.appendChild(controlUI);

            var controlchild = document.createElement('input');
            controlchild.type = "range";
            controlchild.id = "myrange";

            controlchild.oninput = function() {
                //console.log(document.getElementById("myrange").value)
            }

            controlUI.appendChild(controlchild);
        }
        return slider;
    }
}

// time input
let control_time = {
    construct: function() {
        var time = {};
        time.div = document.createElement('div');
        time.set = function() {
            var timeUI = document.createElement('div');
            timeUI.id = 'datetime';
            time.div.appendChild(timeUI);

            var timeUIchild_begin = document.createElement('input')
            timeUIchild_begin.type = 'date';
            timeUIchild_begin.id = 'mydate_beg';
            timeUIchild_begin.value = "2015-07-01";
            beginTime = timeUIchild_begin.value;

            var timeUIchild_end = document.createElement('input')
            timeUIchild_end.type = 'date';
            timeUIchild_end.id = 'mydate_end';
            timeUIchild_end.value = "2015-07-11";
            endTime = timeUIchild_end.value;

            timeUIchild_begin.oninput = function() {
                beginTime = timeUIchild_begin.value;
            }
            timeUIchild_end.oninput = function() {
                endTime = timeUIchild_end.value;
            }

            var str = document.createElement('div');
            str.innerHTML = "~";

            timeUI.appendChild(timeUIchild_begin);
            timeUI.appendChild(str);
            timeUI.appendChild(timeUIchild_end);
        }
        return time;
    }
}

// chart div 
let control_chart = {
    construct: () => {
        let chart = {};
        chart.div = document.createElement('div');
        chart.markerindex;
        chart.set = function(i) {
            // the d3 chart block 
            chart.div.className = 'chart';
            chart.div.style.width = parseInt(window.getComputedStyle(document.getElementById('chartblock'), null).getPropertyValue("width"), 10) - 20 + 'px';
            chart.div.style.height = parseInt(window.getComputedStyle(document.getElementById('chartblock'), null).getPropertyValue("height"), 10) / 3 + 'px';
            chart.div.id = 'chart' + i;
            chart.div.innerHTML = i;

            // lest number image
            chart.img = document.createElement('img');
            chart.img.src = icon + i + '.png';
            chart.img.className = 'image';
            chart.div.appendChild(chart.img);

            // the plotly
            let info = document.createElement('div');
            info.id = 'info' + i;
            chart.div.appendChild(info);
            // the close btn
            chart.closebtn = document.createElement('div');
            chart.closebtn.className = 'close';
            chart.closebtn.index = i;
            chart.closebtn.onclick = () => {
                document.getElementById('chart' + i).remove();
                map_location.occupy.pop();
                map_location.release.push(i);
                chart.markerindex.setIcon(null);
                chart.markerindex.setAnimation(null);

                if (map_location.occupy.length === 0) {
                    document.getElementById('chartblock').remove();
                    document.getElementById('map').style.width = window_width + 'px';
                }
            }
            chart.div.appendChild(chart.closebtn);
        }
        return chart;
    }
}

map = initial_map.construct();

function initialmap() {
    map_main = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: map.center,
        disableDefaultUI: true
    });

    map_location = location_info.construct();

    //draw the control item 
    map_slider = control_slider.construct(); // this is the color line 
    map_slider.set();

    map_time = control_time.construct(); // this is the time selection
    map_time.set();

    // if you want to add the id control item, you should add in the default initmap function 
    map_main.controls[google.maps.ControlPosition.TOP_CENTER].push(map_time.div);
    map_main.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(map_slider.div);
    // map_main.controls[google.maps.ControlPosition.LEFT_TOP].push(map_chart[0].div);

    let query = {
        "startTime": beginTime,
        "endTime": endTime
    };
    updateMarkers(query);
    // getChart("VP8GX40_0", startTime, endTime);
}

function addMarker(item, co) {
    var index = markersArray.length;
    var marker = new google.maps.Marker({
        position: { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) },
        map: map_main,
        vd_name: item.VD_Name,
        icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            fillColor: co,
            fillOpacity: 1,
            strokeColor: co,
            scale: 6
        }
    });
    markersArray.push(marker);
    marker.addListener('click', function() {
        clickMarkerEvent(index);
    });
}

function add_left_block(lat, lng, map, map_main) {
    let get_map = document.getElementById('map');
    let body = document.getElementsByTagName('body');
    get_map.style.width = (window_width / 3 * 2) + 'px';

    let div = document.createElement('div');
    div.id = 'chartblock';
    div.style.width = window_width / 3 + 'px';
    div.style.height = window_height + 'px';
    body[0].appendChild(div);
}

function updateMarkers(query) {
    httpHelper.post(dayUrl, query, (data) => {
        // Get new loss
        let loss = data.reduce((pv, cv) => {
            if (pv[cv.vd_name]) {
                pv[cv.vd_name] += JSON.parse(cv.loss)[1];
            } else {
                pv[cv.vd_name] = JSON.parse(cv.loss)[1];
            }
            return pv;
        }, {});
        // Resort vdGps
        vdGps.sort((a, b) => {
            return loss[a.vd_name] > loss[b.vd_name];
        });

        // Update markers according to new loss 
        for (item in vdGps) {
            let vdName = vdGps[item].vd_name;
            let gps = { lat: parseFloat(vdGps[item].lat), lng: parseFloat(vdGps[item].lon) };
            let color = `rgb(${(item/vdGps.length*255)|0}, ${(255 - item/vdGps.length*255)|0}, 0)`;
            if (vdName in markerDict) {
                markerDict[vdName] = {
                    position: gps,
                    map: map_main,
                    title: vdName,
                    vd: vdName,
                    icon: {
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        fillColor: color,
                        fillOpacity: 1,
                        strokeColor: color,
                        scale: 6
                    }
                }
            } else {
                markerDict[vdName] = new google.maps.Marker({
                    position: gps,
                    size: (50, 15),
                    map: map_main,
                    vd: vdName,
                    ZIndex: 1000
                        // icon: {
                        //     path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        //     fillColor: color,
                        //     fillOpacity: 1,
                        //     strokeColor: color,
                        //     scale: 6
                        // }
                });
                //draw the chart for the map *old
                markerDict[vdName].addListener('click', function() {
                    let map_chart = control_chart.construct();
                    map_chart.markerindex = this;
                    const index = map_location.release.pop();
                    if (map_location.occupy.length === 0) { // use === or !== rather than == or !=
                        add_left_block(gps.lat, gps.lng, map, map_main);
                        let fatherblock = document.getElementById('chartblock');

                        map_chart.set(index);
                        fatherblock.appendChild(map_chart.div);
                        map_location.occupy.push(1);
                    } else {
                        let fatherblock = document.getElementById('chartblock');

                        map_chart.set(index);
                        fatherblock.appendChild(map_chart.div);
                        map_location.occupy.push(1);
                    }
                    reChart(vdName, beginTime, endTime, 'info' + index, map_chart.div.style.height, false);
                    // getChart(vdName, beginTime, endTime, 'info' + index);
                    map_main.setCenter({
                        lat: gps.lat,
                        lng: gps.lng
                    });
                    map_main.setZoom(14);
                    this.setIcon(icon + index + '.png');
                    this.setAnimation(google.maps.Animation.BOUNCE);
                });
            }
        }
    });
}