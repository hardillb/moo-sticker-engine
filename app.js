var express = require('express');
var OAuth = require('oauth');

var app = express();
var config = require('./config.js');

var trackingid = 0;

var port = 3000;
var host = (process.env.VCAP_APP_HOST || 'localhost');

if (process.env.VCAP_SERVICES) {
  var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
  console.log("%j",vcap_services);

  port = process.env.VCAP_APP_PORT;
}



//encodeURIComponent(JSON.stringify(pack))

app.get("/create", function(req, res){

	var pack = config.pack;

	var post_body = {
		"method": "moo.pack.createPack",
		"product": "sticker",
		"pack": JSON.stringify(pack),
		"trackingId": "mqtt-"+(trackingid++)
	};

	var oauth = new OAuth.OAuth(
		null,
		null,
		config.key,
		config.secret,
		'1.0',
		null,
		'HMAC-SHA1'
	);

	oauth.post(
		"https://www.moo.com/api/service/",
		null,
		null,
		post_body,
		"application/x-www-form-urlencoded",
		function(err, data, result){
			if (err) {
				console.log("%j", err);
				res.send("There is a problem at Moo");
			} else {
				var moo = JSON.parse(data);
				console.log("%j", moo);
				if (moo.dropIns.finish) {
					res.redirect(moo.dropIns.finish);
				} else {
					res.send("There is a problem at Moo");
				}
			}
		});
});


app.get("/callback", function(req, res){
	console.log("order placed: " + req.query.trackingId);
	res.send(200,"");
})

var server = app.listen(port, function() {
	console.log("running");
	console.log("host:" + host);
	console.log("port:" + port);
});
