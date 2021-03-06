var route = require('koa-route');

var config = require('../../config/general.json').mailforward;
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.MANDRILL_KEY);

module.exports = function(app) {
	app.use(route.post('/api/mailforward/hook/' + config.MANDRILL_PASSPHRASE, webhook));

	function *webhook() {
		var received = {};
		try {
			var received = JSON.parse(this.request.body.mandrill_events)[0].msg;
		} catch(e) {
			console.log("not a mandrill event");
			console.log(e);
		}
		console.log(received);

		var message = {
			"html": received.html,
			"from_email": received.from_email,
			"from_name": received.from_name,
			"subject": received.subject,
			"to": config.mailTo,
			"headers": {
				"Reply-To": received.from_email
			},
		};

		mandrill_client.messages.send({"message": message, "async": true }, function(result) {
			console.log(result);
		}, function(e) {
			console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		});
		this.body = "true";
	}
}
