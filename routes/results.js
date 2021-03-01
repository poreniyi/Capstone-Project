let router = require('express').Router();
const Rendeview = require('../rendeview.js');
const Rendeview2 = require('../rendeview2.js');

// router.post('/results', function(req, res) {
//     var locationTextField = req.body.location;
//     var test = new Rendeview(locationTextField);
//     var coordinates = [];
//     test.exportCoordinates().then(exportData=>{
//         coordinates = exportData;
//         console.log(coordinates);
//         res.render('results',{data:req.body, 
//                               centerpointLat:coordinates[0],
//                               centerpointLng:coordinates[1]
//                             });
//     })
// })

router.post('/results', async(req,res)=>{
    var locationTextField = req.body.location;
    var test = new Rendeview2(locationTextField);
    let apiData=await test.exportCoordinates();
    centerpoint=apiData.centerpointCoordinates;
    res.locals.loc=apiData.locationCoordinates;
    res.render('results',{
        data:req.body,
        centerpoint,
         })
})
module.exports=router;
