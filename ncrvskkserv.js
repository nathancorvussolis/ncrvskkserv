/*
	ncrvskkserv 0.4.0
	Copyright 2013-2016, SASAKI Nobuyuki. Licensed under the MIT license.

	Node.js SKK server
	Usage: node ncrvskkserv.js SKK-JISYO.L
*/

var net = require('net');
var fs = require('fs');
var os = require('os');

var host = '127.0.0.1'
var port = 1178;
var version = 'ncrvskkserv 0.4.0';
var dictionary = {};

console.log(version);

if(process.argv.length != 3) {
	console.log('usage: node ncrvskkserv.js <skk dic file>');
	return;
}

var server = net.createServer(function(c) {
	c.on('data', function(data) {
		var res = '4\n';
		var req = data.toString('binary');
		var cmd = req.substr(0, 1);

		switch(cmd) {
		case '0':
			c.end();
			break;
		case '1':
			var key = req.substr(1);
			if(dictionary[key] != null) {
				res = '1' + dictionary[key];
			}
			break;
		case '2':
			res = version + ' ';
			break;
		case '3':
			res = os.hostname() + ':' + c.localAddress + ' ';
			break;
		default:
			break;
		}

		switch(cmd) {
		case '0':
			break;
		default:
			c.write(res, 'binary');
			break;
		}
	});
});

server.listen(port, host, function() {
	var buff = fs.readFileSync(process.argv[2], 'binary');
	var lines = buff.split('\n');
	var count = 0

	for(var i in lines) {
		var line = lines[i];
		if(line.startsWith(';;')) continue;
		var sp = line.indexOf(' /');
		if(sp == -1) continue;

		var key = line.substr(0, sp + 1);
		var candidates = line.substr(sp + 1) + '\n';
		dictionary[key] = candidates;
		++count;
	}

	console.log('entry: ' + count);
	console.log('port: ' + port);
});
