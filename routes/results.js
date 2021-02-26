let router = require('express').Router();

router.post('/results', function(req, res) {
    res.render('results',{data:req.body});
})

module.exports=router;
