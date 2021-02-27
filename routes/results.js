let router = require('express').Router();
const Rendeview = require('../rendeview.js');

router.post('/results', function(req, res) {
    var locationTextField = req.body.location;
    var test = new Rendeview(locationTextField);
    console.log(test.debugPrint());

    res.render('results',{data:req.body});
})

module.exports=router;
