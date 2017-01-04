var Stellar = require('stellar-sdk'); 
var request = require('request');
var config = require('config');
// StellarSDK.Network.usePublicNetwork();
var server = new Stellar.Server(config.get('testNetwork'));



module.exports = {
  account: function (account_id, req, res) {
    
    server.accounts().accountId(account_id ).call()
      .then(function(account)
      {
        console.log('Account: ',account);
        var balances = "";
        
        account.balances.forEach(function(balance) {
          console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
          var asset = "";
          if (balance.asset_type === 'native') {
            asset = 'Asset Code: XLM';
          }else{
            asset = 'Asset Code: '+balance.asset_code+"\nAsset Issuer: "+balance.asset_issuer;
          }

          balances +="Amount: "+balance.balance+"\n"+asset+"\n-------\n";
        });

        var signers = "";
        account.signers.forEach(function(signer) {
          console.log('ID:',signer.publik_key , ', Weight:', signer.weight);
          signers += "Signer: "+signer.public_key+"\n"+"Weight: "+signer.weight+"\n";
        });

        var text = "Account Balance\n"+balances+"Sequence No: "+account.sequence+"\n-------\n";
            text += "Low Threshold: "+account.thresholds.low_threshold+"\n-------\n";
            text += "Medium Threshold: "+account.thresholds.med_threshold+"\n-------\n";
            text += "High Threshold: "+account.thresholds.high_threshold+"\n-------\n";
            text += "Auth Required: "+account.flags.auth_required+"\n-------\n";
            text += "Auth Revocable: "+account.flags.auth_revocable+"\n-------\n";
            text += "Signers\n"+signers+"\n-------\n";

        if (account.inflation_destination) {
          text +="\nInflation Destination: "+account.inflation_destination+"\n-------\n";
        }

        if (account.home_domain) {
          text +="\nHome Domain: "+account.home_domain+"\n-------\n";
        }

        var response = {};
            response.text = "Account Details for "+account_id;

              response.attachments = [
                          {"color": "#3aa3e3",
                            "text": text,
                          }];
        reply(req.body.response_url, response);


      })
      .catch(function(error)
      {
        console.log("Error", error);
        var response = {};
            response.text = "Error: Unable to load account";
        reply(req.body.response_url, response);        
      });


  },

  balance: function (account_id, req, res) {
    // check if account id is valid
    
    if (Stellar.Keypair.isValidPublicKey(account_id)) {
      server.accounts().accountId(account_id ).call()
        .then(function(account)
        {
          console.log('Account: ',account);
          var balances = "";
          
          account.balances.forEach(function(balance) {
            console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
            var asset = "";
            if (balance.asset_type === 'native') {
              asset = 'Asset Code: XLM';
            }else{
              asset = 'Asset Code: '+balance.asset_code+"\nAsset Issuer: "+balance.asset_issuer;
            }

            balances += "Amount: "+balance.balance+"\n"+asset+"\n-------\n";
          });

          var text = `Account Balance\n${balances}`;

          var response = {};
              response.text = "Account balance for "+account_id;

                response.attachments = [
                            {"color": "#3aa3e3",
                              "text": text,
                            }];
          reply(req.body.response_url, response);


        })
        .catch(function(error)
        {
          console.log("Error", error);
          var response = {};
              response.text = "Error: Unable to load account";
          reply(req.body.response_url, response);        
        });
    } else{
          
          var response = {};
              response.text = "Error: Invalid account details";
          reply(req.body.response_url, response);        

    }

  },

  tx: function (tx_id, req, res) {
    server.transactions().transaction(tx_id ).call()
      .then(function(record) 
      {
        console.log('TX Record: ',record);
        // var result_code = record.result_code_s.toUpperCase().split("_").join(" ");
        var text = `Source Account: ${record.source_account}\n
        Transaction Date: ${record.created_at}\n
        Source Account Sequence: ${record.source_account_sequence}\n
        Fees: ${record.fee_paid}\n
                
            `;

        var response = {}
            response.text = "Transaction Details for "+tx_id;
              response.attachments = [
                          {"color": "#3aa3e3",
                            "text": text,
                          }];
            reply(req.body.response_url, response);

        
      })
      .catch(function(error)
      {
        console.log("Error", error);
        var response = {};
            response.text = "Error: Unable to load transaction";
        reply(req.body.response_url, response);
      });
  },

};

function reply (url,response) {
        
  request.post({
      url: url,
      body: response,
      json: true
    }, function(error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error('ERROR!', error || body);
      }
      else {
        console.log('SUCCESS! Response sent :)\n', body);
        
      }
    }
  );
}