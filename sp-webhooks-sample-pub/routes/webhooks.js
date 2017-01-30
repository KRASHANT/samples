var express = require('express');
var router = express.Router();

const handleNotification = (data) => {
    console.log("============NOTIFICATION==============");
  console.log(`Subscription: ${data.subscriptionId}`);
  console.log(`Client State: ${data.clientState}`);
  console.log(`Expiration: ${data.expirationDateTime}`);
  console.log(`Resource: ${data.resource}`);
  console.log(`Site Url: ${data.siteUrl}`);
  console.log(`Web ID: ${data.webId}`);
  console.log("===========/NOTIFICATION==============");
};

// Webhook handler
router.post('/', (req, res) => {
  // Validate if new subscription
  if (req.query.validationtoken) {
    // Return a text/plain Success response
    // with the validationToken query string parameter
    res.setHeader("Content-Type", "text/plain");
    res.send(200, req.query.validationtoken);
    return;
  }

  let payload = req.body.value;
  if (!payload) {
    res.send(400, "Bad Request");
    return;
  }

  if (Array.isArray(payload)) {
    payload.forEach(notification => {
      handleNotification(notification);
    });
  } else {
    handleNotification(payload);
  }

  res.send(200, "OK");
});

module.exports = router;
