/*
	necrvskkserv 0.3.0
	Copyright 2016, SASAKI Nobuyuki. Licensed under the MIT license.

	Node.js SKK server
	Usage: node necrvskkserv.js SKK-JISYO.L
*/

var net = require('net');
var fs = require('fs');
var os = require('os');

var host = '127.0.0.1'
var port = 1178;
var version = 'necrvskkserv 0.3.0';
var dictionary = new Array();

if(process.argv.length != 3) return;

var server = net.createServer(function(c) {
	c.on('data', function(data) {
		var req = data.toString('binary');
		var res = '4\n';
		var cmd = req.substr(0, 1);
		switch(cmd) {
		case '0':
			c.end();
			break;
		case '1':
			var key = req.substr(1);
			var l = 0;
			var r = dictionary.length - 1;
			while(l <= r) {
				var m = parseInt((l + r) / 2);
				var keycmp = dictionary[m].key;
				if(key == keycmp) {
					res = '1' + dictionary[m].candidate;
					break;
				}
				else if(key > keycmp) l = m + 1;
				else if(key < keycmp) r = m - 1;
			}
			c.write(res, 'binary');
			break;
		case '2':
			res = version + ' ';
			c.write(res, 'binary');
			break;
		case '3':
			res = os.hostname() + ':' + c.localAddress + ' ';
			c.write(res, 'binary');
			break;
		default:
			c.write(res, 'binary');
			break;
		}
	});
});

server.listen(port, host, function() {
	var fc = fs.readFileSync(process.argv[2], 'binary');
	var ln = fc.split('\n');
	for(var i in ln) {
		if(ln[i].startsWith(';;')) continue;
		var sp = ln[i].indexOf(' /');
		if(sp == -1) continue;
		dictionary.push({
			'key': ln[i].substr(0, sp + 1),
			'candidate': ln[i].substr(sp + 1) + '\n'
		});
	}
	dictionary.sort(function(x, y) {
		return x.key > y.key ? 1 : -1;
	});
	console.log('entry count : ' + dictionary.length);
	console.log('server bound port ' + port);
});
