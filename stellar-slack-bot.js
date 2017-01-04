var Slack = require('@slack/client');
var Stellar = require('stellar-sdk'); 
var config = require('config');
var express = require('express');
var bodyparser = require('body-parser');
var database = require('./config/database');
var routes = require('./routes');

var app = express();

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

routes.configure(app);
global.webhookArray = [];
var txStream = ""; //transaction stream
var IncomingWebhook = Slack.IncomingWebhook;
var url = process.env.SLACK_WEBHOOK_URL || ''; //see section above on sensitive data
webhookArray.push(url);


// get webhooks
database.teams.forge().fetch()
  .then(function(models) {
    models.toJSON().forEach(function(m) {
      webhookArray.push(m.webhook_url);
    });
    console.log("webhookArray", webhookArray);
  })
  .catch(function(error) {
    console.log("retrieving teams error", error);
  });


var webhook = new IncomingWebhook(url);
var server = new Stellar.Server(config.get('testNetwork'));

var payload = {
								"username": "stellar-bot",
    						"icon_emoji": ":rocket:",
    						"mrkdrm" : "true",
              };

txStream = server.operations()
                        .cursor('now')
                        .stream({
                          onmessage: processTransaction,
                          onerror: processError
                        });

function processTransaction (record) {

  var text = getTextById(record);
  
  payload.text = text;

  webhookArray.forEach(function(url) {
    webhook = new IncomingWebhook(url);
    webhook.send(payload, function(err, res) {
      if (err) {
          console.log('Error:', err);
      } else {
          console.log('Message sent: ', res);
      }
    });
  });

	

}

function processError(error) {
	console.log("An error occured. could not process transaction\n");
	console.log("Error\n", error);
  
}


function getTextById (record) {
  console.log("record: \n", record);
  var retVal = "";
  var text = "";
  var operationType = record.type.toUpperCase().split("_").join(" ");
  var operationID = record.id;

  // get content from operation, based on the type
  
  switch(record.type_i){
    case 0:
      text = `  Account: ${record.account}\n
                Funder: ${record.funder}\n
                Starting Balance: ${record.starting_balance} XLM\n
            `;
    break;
    
    case 1:
      var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
      text = `From: ${record.from}\n
              To: ${record.to}\n
              Asset: ${asset}\n
              Amount: ${record.amount} 
             `;
    break;

    case 2:
      var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
      var sent_asset = record.sent_asset_type === 'native' ? 'XLM' : record.sent_asset_code;
      
      text = `From: ${record.from}\n
              To: ${record.to}\n
              Asset: ${asset}\n
              Amount: ${record.amount}\n
              Sent Asset: ${sent_asset}\n
              Source Amount: ${record.source_amount}
             `;
    break;

    case 3:
      var buying_asset = record.buying_asset_type === 'native' ? 'XLM' : record.buying_asset_code;
      var selling_asset = record.selling_asset_type === 'native' ? 'XLM' : record.selling_asset_code;
      var price_r = "";
      if (record.price_r) {
        price_r = "Price_r: "+record.price_r.n+"/"+record.price_r.d+"";
      }
      text = `Offer ID: ${record.offer_id}\n
              Amount: ${record.amount}\n
              Buying Asset: ${buying_asset}\n
              Buying Asset Issuer: ${record.buying_asset_issuer}\n
              Selling Asset: ${selling_asset}\n
              Selling Asset Issuer: ${record.selling_asset_issuer}\n              
              Price: ${record.price}\n
              ${price_r}

             `;    
    break;

    case 4:
      var buying_asset = record.buying_asset_type === 'native' ? 'XLM' : record.buying_asset_code;
      var selling_asset = record.selling_asset_type === 'native' ? 'XLM' : record.selling_asset_code;
      var price_r = "";
      if (record.price_r) {
        price_r = "Price_r: "+record.price_r.n+"/"+record.price_r.d+"";
      }
      text = `Offer ID: ${record.offer_id}\n
              Amount: ${record.amount}\n
              Buying Asset: ${buying_asset}\n
              Buying Asset Issuer: ${record.buying_asset_issuer}\n
              Selling Asset: ${selling_asset}\n
              Price: ${record.price}\n
              ${price_r}

             `;     
    break;
    case 5:
      text = `Low threshold: ${record.low_threshold}\n
              Medium threshold: ${record.med_threshold}\n
              High threshold: ${record.high_threshold}\n
              Home Domain: ${record.home_domain}\n
              Signer Key: ${record.signer_key}\n
              Signer Weight: ${record.signer_weight}\n
              Master Key Weight: ${record.master_key_weight}\n
             `;     
    break;
    case 6:
      var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
      
      text = `Trustee: ${record.trustee}\n
              Trustor: ${record.trustor}\n
              Limit: ${record.limit}\n
              Asset: ${asset}\n
              Asset Issuer: ${record.asset_issuer}\n
             `;     
    break;

    case 7:
      var asset = record.asset_type === 'native' ? 'XLM' : record.asset_code;
      
      text = `Trustee: ${record.trustee}\n
              Trustor: ${record.trustor}\n
              Limit: ${record.limit}\n
              Asset: ${asset}\n
              Asset Issuer: ${record.asset_issuer}\n
              Authorize: ${record.authorize}
             `;       
    break;
    
    case 8:
      text = `Account: ${record.account}\n
              Into: ${record.into}\n
              `;    
    break;
    
    case 9:
      
    break;                                
    
    default: ;
  }


  retVal = `${operationType}\n
            Operation ID: ${operationID}\n
            ${text}
          `;

  return retVal;

}

var server = app.listen(8080, function() {
  console.log('Server listening on port ' + server.address().port);
});