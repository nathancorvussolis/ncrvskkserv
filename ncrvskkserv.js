/*
	ncrvskkserv 0.2.2

	Copyright 2013-2015, SASAKI Nobuyuki. Licensed under the MIT license.

	参照：     http://nodejs.org/

	実行方法： > node.exe ncrvskkserv.js SKK-JISYO-UTF8.L

	備考：     Node.jsを用いたSKK辞書サーバーです。
	           文字コードがUTF-8、改行がLFのSKK辞書を使用して下さい。
	           起動時にSKK辞書をメモリ上に展開します。
	           ポートを1179、文字コードをUTF-8に設定して下さい。
*/

var net = require('net');
var fs = require('fs');
var os = require('os');

var port = 1179;
var version = 'ncrvskkserv 0.2.2';
var dictionary = new Array();

if(process.argv.length != 3) return;

var server = net.createServer(function(c) {
	c.on('data', function(data) {
		var req = data.toString();
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
			c.write(res);
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
	console.log('reading dictionary...');
	var fc = fs.readFileSync(process.argv[2], 'utf8');
	var ln = fc.split('\n');
	var es = -1;
	for(var i in ln) {
		if(es == -1) {
			if(ln[i] == ';; okuri-ari entries.' ||
				ln[i] == ';; okuri-nasi entries.') es = 0;
			continue;
		}
		var sp = ln[i].indexOf(' ');
		if(sp == -1) continue;
		var sl = ln[i].indexOf('/', sp + 1);
		if(sl == -1) continue;
		dictionary.push({
			'key': ln[i].substr(0, sp + 1),
			'candidate': ln[i].substr(sl) + '\n'
		});
	}
	dictionary.sort(function(x, y) {
		return x.key > y.key ? 1 : -1;
	});
	console.log('entry count : ' + dictionary.length);
	console.log('server bound port ' + port);
});
