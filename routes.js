var Stellar = require('stellar-sdk'); 
var config = require('config');
var server = new Stellar.Server(config.get('testNetwork'));
var action = require('./actions');
var request = require('request');

module.exports = {
  configure: function(app) {



    app.post('/stellar', verifyToken, function(req, res) {
        
        // Get arguments
        // Check if arguments are valid types that you respond to.
        // process each argument

        var args = req.body.text.split(/\s+/);
        console.log("ARGS", args);

        switch(args[0]){
          case 'account':
            res.status(200).send({text: "Connecting to Stellar ..."});
            action.account(args[1], req, res);

          break;

          case 'balance':
            res.status(200).send({text: "Connecting to Stellar ..."});
            action.balance(args[1], req, res);

          break;

          case 'tx':
            res.status(200).send({text: "Connecting to Stellar ..."});
            action.tx(args[1], req, res);
          break;

          default:
          // send help
          var text = "You can query the Stellar network for account information and ";
              text += "transactions as follows: \n/stellar account [account_id]\n";
              text += "/stellar balance [account_id] \n/stellar tx [transaction_id]\n";
              
          var response = {};
              response.text = "Oops!! seems you missed something.";
              response.attachments = [
                          {
                          "title":"Usage",
                          "text": text,
                            }];
              res.send(response);
          
        }
          
    });

    app.get('/slack',  function(req, res) {

      var authData = {form: { 
        client_id: process.env.SLACK_CLIENT_ID, 
        client_secret: process.env.SLACK_CLIENT_SECRET, 
        code: req.query.code 
      }}; 
        
      request.post('https://slack.com/api/oauth.access', authData, 
        function (error, response, body) { 
        if (!error && response.statusCode == 200) { 
          
          var token = JSON.parse(body).access_token;
          var webhookUrl = JSON.parse(body).incoming_webhook.url;
          webhookArray.push(webhookUrl);
          console.log("webhookArray", webhookArray);
          
          request.post('https://slack.com/api/team.info', {form: {token: token}}, 
            function (error, response, body) {
            if (!error && response.statusCode == 200) {
              if(JSON.parse(body).error == 'missing_scope') {
                res.send('Stellar Slack has been added to your team!');
              } else {
                var team = JSON.parse(body).team.domain;
                res.redirect('http://' +team+ '.slack.com');
              }
            }
          });

        } 
          
      });

  });

  }
};

// route middleware to validate token
function verifyToken(req, res, next) {

    // if token is valid, carry on 
    if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN)
        return next();
    
    return res.send({ text: "Invalid request token. Unable to process" });
    
}




