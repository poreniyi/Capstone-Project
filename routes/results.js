let router = require('express').Router();

router.post('/results', function(req, res) {
    console.log(req.body);
    console.log('I am the results');
    res.render('results',{data:req.body});
})

module.exports=router;
// <%=data.location.forEach(element=>{ %> 
                
//     <% })%>