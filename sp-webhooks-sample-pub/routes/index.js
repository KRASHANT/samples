var express = require('express');
var router = express.Router();

var sp = require("spaddin-helper");
var config = require("../config");

/* GET home page. */
router.get('/', function(req, res, next) {
  let ctx = new sp.SharePointContext(config.SPHostUrl);
  ctx.createAppOnlyClientForSPHost().then(client => {
      client.retrieve('_api/web/Title')
      .then(data => {
          let webTitle = data.d.Title;
          res.render('index', { title: "WebHook on site " + webTitle });
      }).catch((error) => {
        res.render('error', { error: error });
      });
  });
});

router.get('/subscriptions', (req, res) => {
  let ctx = new sp.SharePointContext(config.SPHostUrl);
  ctx.createAppOnlyClientForSPHost().then(client => {
        let vm = {
          lists: []
        };
      
      // We retrieve all the lists of the current web
      client.retrieve('_api/web/lists?$select=Title,Id')
      .then(data => {
          // Add the results to the ViewModel
          vm.lists = data.d.results;
      }).then(() => {
          res.render('subscriptions', vm);
      }).catch((error) => {
          res.render('error', {error:error});
      });
  });
});

router.post('/subscriptions', (req, res) => {
  let ctx = new sp.SharePointContext(config.SPHostUrl);

  // We verify the listId POST argument
  let listId = req.body.listId;
  if (!listId) {
    res.send(400);  // Bad request
    return;
  }

  ctx.createAppOnlyClientForSPHost().then(client => {   
      // Content Type is not ODATA but regular JSON
      client.odataVerbose = false;
      client.create(`_api/web/lists('${listId}')/subscriptions`,{
        resource: ctx.SPHostUrl + `_api/web/lists('${listId}')`,
        notificationUrl: config.WebhooksUrl,
        expirationDateTime: "2017-02-18T00:00:00+00:00"
      })
      .then((resp) => {
          let error = resp["odata.error"];
          if (error) {
            res.render('error', {message: error.message.value ,error:{status:"",stack:""}});
          } else {
            res.render("subscriptions", {subscriptionCreated:true, listId: listId});
          }
      })
      .catch((error) => {
          res.render('error', {error:error});
      });
  });
});

module.exports = router;
