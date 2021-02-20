var express = require('express');
var app = express();
var path = require('path')

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/home.html'));
})
app.set("port", process.env.PORT || 8081);

var server = app.listen(app.get("port"), function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})