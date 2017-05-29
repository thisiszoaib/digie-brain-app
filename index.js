const express = require('express');
const restService = express();
const bodyParser = require('body-parser');

restService.use(bodyParser.urlencoded({
	extended:true
}));

restService.use(bodyParser.json());

restService.get('/',function(req,res)
{
	res.send('Hello World')
})

restService.post('/echo', function(req, res) {
    var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
});

restService.listen((process.env.PORT || 8000),function(){
	console.log('Server started.');
})