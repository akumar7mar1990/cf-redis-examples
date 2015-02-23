var vcap_services = process.env.VCAP_SERVICES;
var rediscloud_service = JSON.parse(vcap_services)["rediscloud"][0];
var creds = rediscloud_service.credentials;
var redis = require('redis');
var express = require('express');
var app = express();

app.get('/', function(req, rep) {
  var subscriber = redis.createClient(creds.port, creds.hostname, {no_ready_check: true});
  var publisher = redis.createClient(creds.port, creds.hostname, {no_ready_check: true});
  subscriber.auth(creds.password);
  publisher.auth(creds.password);

  publisher.incr("rtt:counter", function(err, counter) {
    subscriber.on("message", function(channel, message) {
      var lat = Date.now() - parseInt(message);
      rep.end(" Latency is " + lat + "ms");
      subscriber.unsubscribe(channel);
      subscriber.end();
    });
    subscriber.subscribe("client:" + counter);
    publisher.publish("server:" + counter, Date.now());
    publisher.end();
  });
});

app.listen(process.env.VCAP_APP_PORT);
