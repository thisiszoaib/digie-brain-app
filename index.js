const express = require('express');
const restService = express();
const bodyParser = require('body-parser');

restService.use(bodyParser.urlencoded({
	extended:true
}));

restService.use(bodyParser.json());

restService.post('/echo', function(req, res) {
    var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
});

restService.listen(3000,function(){
	console.log('Example app listening on port 3000');
})