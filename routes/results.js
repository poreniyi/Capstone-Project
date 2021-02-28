let router = require('express').Router();
const Rendeview = require('../rendeview.js');

router.post('/results', function(req, res) {
    var locationTextField = req.body.location;
    var test = new Rendeview(locationTextField);
    var coordinates = [];

    test.exportCoordinates().then(exportData=>{
        coordinates = exportData;
        console.log(coordinates);
        res.render('results',{data:req.body, 
                              centerpointLat:coordinates[0],
                              centerpointLng:coordinates[1]
                            });
    })
})

module.exports=router;
