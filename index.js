const express = require('express');
const restService = express();
const bodyParser = require('body-parser');
const request = require('request');

var optionsAuthenticate = {
  url: 'https://mydigie.com/php/authenticateUser.php',
  headers: {
    'Cookie': 'testing123',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  method: 'POST',
  body: 'Username=testuser4&Password=techlogix',
  rejectUnauthorized: false
};

restService.use(bodyParser.urlencoded({
  extended: true
}));

restService.use(bodyParser.json());

restService.get('/', function (req, res) {
  res.send('Hello World.')
})

restService.post('/echo', function (req, res) {
  var isStatementThere = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText;

  if (isStatementThere) {

    var statement = req.body.result.parameters.echoText;

    request(optionsAuthenticate, function (error, response, body) {
      var authenticationResponse = body;
      authenticationResponse = authenticationResponse.replace(/[\n\r\t]/g, ' ');
      authenticationResponse = authenticationResponse.trim();

      var separatedResponse = authenticationResponse.split("-");
      var sessionId = separatedResponse[0].substring(13).trim();

      var processStatementOptions = {
        url: 'https://mydigie.com/php/processStatement.php',
        headers: {
          'Cookie': 'PHPSESSID=' + sessionId,
          'Connection': 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        body: 'SessionID=' + sessionId + '&Language=English&DBName=myDigie&Statement=' + statement,
        rejectUnauthorized: false
      };

      request(processStatementOptions, function (error, response, body) {

        var speech = body.replace(/[\n\r\t]/g, ' ').trim().substring(15);

        return res.json({
          speech: speech,
          displayText: speech,
          source: 'webhook-echo-sample'
        });
      });



    });
  } else {
    return res.json({
      speech: 'No input was sent.',
      displayText: 'No input was sent.',
      source: 'webhook-echo-sample'
    });
  }




});

restService.listen((process.env.PORT || 80), function () {
  console.log('Server started.');
})