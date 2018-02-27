let httpHelper = {
    get: (url) => {
        let http = new XMLHttpRequest();
        http.open("GET", url, false);
        http.send(null);
        return http.responseText;

    },
    post: (url, query, cb) => {
        $.jpost(url, query).then(res => {
            cb(res);
        });
    }
}

// jQuery extension
$.extend({
    jpost: function(url, body) {
        return $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(body),
            contentType: "application/json",
            dataType: 'json'
        });
    }
});