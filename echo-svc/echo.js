var vcap_services = process.env.VCAP_SERVICES;
var rediscloud_service = JSON.parse(vcap_services)["rediscloud"][0];
var creds = rediscloud_service.credentials;
var redis = require('redis');
var subscriber = redis.createClient(creds.port, creds.hostname, {no_ready_check: true});
var publisher = redis.createClient(creds.port, creds.hostname, {no_ready_check: true});

subscriber.auth(creds.password);
publisher.auth(creds.password);

subscriber.on("pmessage", function(pattern, channel, message) {
  replyChannel = "client:" + channel.split(":")[1];
  publisher.publish(replyChannel, message);
});

subscriber.psubscribe("server:*");
