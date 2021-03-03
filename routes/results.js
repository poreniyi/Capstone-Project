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
    locationTextField=locationTextField.filter(location=>location);
    locationTextField=locationTextField.map(location=>location.trim());
    if(!locationTextField.length) res.redirect('/')
    console.log(locationTextField);
    console.log(typeof locationTextField);
    var test = new Rendeview2(locationTextField);
    let apiData=await test.exportCoordinates();
    centerpoint=apiData.centerpointCoordinates;
    res.locals.loc=apiData.locationCoordinates;
    res.render('results',{
        locations:locationTextField,
        centerpoint,
         })
})

router.get('/test',async(req,res)=>{
    let locations=['KSU Marietta','KSU Kennesaw'];
    res.locals.loc=[[33.9408531,-84.5204241],[34.0381785,-84.5826712]];
    let centerpoint=[33.9895158,-84.55154765];
    res.render('results',{locations,centerpoint});
})
module.exports=router;
