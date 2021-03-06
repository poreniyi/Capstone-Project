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
    // var locationTextField = req.body.location;
    let formData=JSON.parse(req.body.data);
    let locationTextField=[];
    formData.forEach(element=>{
        locationTextField.push(element.location);
    })
    locationTextField=locationTextField.filter(location=>location);
    locationTextField=locationTextField.map(location=>location.trim());
    if(!locationTextField.length) res.redirect('/')
    console.log(locationTextField);
    var test = new Rendeview2(locationTextField);
    let apiData=await test.exportCoordinates();
    centerpoint=apiData.centerpointCoordinates;
    res.render('results',{
        locations:locationTextField,
        centerpoint,
        loc:apiData.locationCoordinates
         })
})
let fs=require('fs').promises;
let path=require('path');
router.get('/test',async(req,res)=>{
    let data=await fs.readFile(path.join(__dirname,"../sampleAPIData.json"));
    data=JSON.parse(data);
    res.render('results',{
        locations:data.locations,
        loc:data.loc,
        centerpoint:data.centerpoint,
    });
})
module.exports=router;
