const positionUrl = "http://140.113.210.4:9487/positions";
const dayUrl = "http://140.113.210.4:9487/day";
const minuteUrl = "http://140.113.210.4:9487/minute";
let vdGps = JSON.parse(httpHelper.get(positionUrl));

google.maps.event.addDomListener(window, 'load', initialmap);