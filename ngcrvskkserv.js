/*
	ngcrvskkserv 0.2.2

	Copyright 2013-2015, SASAKI Nobuyuki. Licenced under the MIT license.

	参照：     http://nodejs.org/

	実行方法： > node.exe ngcrvskkserv.js

	備考：     Node.jsを用いたSKK辞書サーバーです。
	           Google CGI API for Japanese Input を用いて検索を行います。
	           送りありと思わしき見出し語は検索しません。
	           注釈に「G」を付加します。
	           ポートを50051、文字コードをUTF-8に設定して下さい。
*/

var net = require('net');
var os = require('os');
//var http = require('http');
var https = require('https');
var querystring = require('querystring')

var port = 50051;
var version = 'ngcrvskkserv 0.2.2';

var server = net.createServer(function(c) {
	c.on('data', function(d) {
		var req = d.toString();
		var res = '4\n';
		var cmd = req.substr(0, 1);
		switch(cmd) {
		case '0':
			c.end();
			break;
		case '1':
			var key = req.substr(1, req.length - 2);
			if(key.match(/[^A-Za-z0-9]+[a-z]/)) {
				c.write(res);
				break;
			}
			var gurl = "https://www.google.com/transliterate?langpair=ja-Hira|ja&text=" +
				querystring.escape(key) + ',';
			https.get(gurl, function(gres) {
				if(gres.statusCode == 200) {
					gres.on('data', function(gdata) {
						res = '1/' + JSON.parse(gdata.toString())[0][1].join(';G/') + ';G/\n';
						c.write(res);
					});
				}
				else {
					c.write(res);
				}
			}).on('error', function(e) {
				c.write(res);
			});
			break;
		case '2':
			res = version + ' ';
			c.write(res);
			break;
		case '3':
			res = os.hostname() + ':' + c.localAddress + ' ';
			c.write(res);
			break;
		default:
			c.write(res);
			break;
		}
	});
});

server.listen(port, function() {
	console.log('server bound port ' + port);
});
