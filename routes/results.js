let router = require('express').Router();
const Rendeview = require('../Rendeview/rendeview.js');
const Rendeview2 = require('..//Rendeview/rendeview2.js');
const Rendeview3 = require('..//Rendeview/rendeview3.js');

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

// router.post('/results', async(req,res)=>{
//     // var locationTextField = req.body.location;
//     let formData=JSON.parse(req.body.data);
//     let locationTextField=[];
//     console.log(formData);
//     formData.forEach(element=>{
//         locationTextField.push(element.location);
//     })
//     locationTextField=locationTextField.filter(location=>location);
//     locationTextField=locationTextField.map(location=>location.trim());
//     if(!locationTextField.length) res.redirect('/')
//     console.log(locationTextField);
//     var test = new Rendeview2(locationTextField);
//     let apiData=await test.exportCoordinates();
//     centerpoint=apiData.centerpointCoordinates;
//     res.render('results',{
//         locations:locationTextField,
//         centerpoint,
//         loc:apiData.locationCoordinates
//          })
// })
router.post('/results', async(req,res)=>{
    let formData=JSON.parse(req.body.data);
    let places=formData.filter(location=>location.coordinates);
    console.log(places.length);
    if(!places.length|| places.length<2) {
        res.redirect('/')
    }else{
        console.log(formData);
        var test = new Rendeview3(formData);
        let data=await test.returnResult();
        res.send(data);
    }  
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

router.get('/test2',(req,res)=>{
    res.render('test2');
})
module.exports=router;