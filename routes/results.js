let router = require('express').Router();
const Rendeview = require('../Rendeview/rendeview.js');
const Rendeview2 = require('..//Rendeview/rendeview2.js');
const Rendeview3 = require('..//Rendeview/rendeview3.js');
let randomWords = require('random-words');


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
router.post('/results', async (req, res) => {
    let formData = JSON.parse(req.body.data);
    let types = JSON.parse(req.body.type);
    let places = formData.filter(location => location.coordinates);
    if (!places.length || places.length < 2) {
        res.redirect('/')
        return;
    }
    var rendezvous = new Rendeview3(formData);
    let data = await rendezvous.returnResult();
    let collection = req.app.locals.collection;
    let id = ''
    let docExists = true
    while (docExists) {
        id = randomWords({ exactly: 1, wordsPerString: 3, maxLength: 7, separator: '' })[0];
        docExists = await collection.findOne({ _id: id });
    }
    data.code=id;
    collection.insertOne({ _id: id, data, DOC: Date.now() });
    let view = `${req.originalUrl}/id:${id}`
    res.redirect(`/code/${id}`)
})

let fs = require('fs').promises;
let path = require('path');
router.get('/test', async (req, res) => {
    let data = await fs.readFile(path.join(__dirname, "../sampleAPIData.json"));
    data = JSON.parse(data);
    res.render('results', {
        locations: data.locations,
        loc: data.loc,
        centerpoint: data.centerpoint,
    });
})

router.get('/test2', (req, res) => {
    res.render('test2');
})

router.get('/code/:code', async (req, res) => {
    let collection = req.app.locals.collection;
    let doc = await collection.findOne({ _id: req.params.code })
    if (!doc) {
        res.send('404');
        return
    }
    data=doc.data;
    data.code=doc._id;
    res.render('result3',data)
})

module.exports = router;