var express = require('express');
var app = express();
var path = require('path')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use('/', require('./routes/home'));


app.post('/results', function(req, res) {
    console.log(req.body);
    res.sendFile(path.join(__dirname + '/home.html'));
})
app.set("port", process.env.PORT || 8081);

var server = app.listen(app.get("port"), function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})