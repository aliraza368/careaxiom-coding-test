const express = require('express')
const app = express()
var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var async=require("async");

function addProtocol(url) {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = "http://" + url;
    }
    return url;
}

app.get('/I/want/title/', function(req, res){
	var queryObject = url.parse(req.url,true).query;
	var addresses = new Array();
	if(typeof queryObject.address != "undefined"){
		var paramsCount = Object.keys(queryObject.address).length;
		if(queryObject.address.constructor === Array){
			addresses = queryObject.address;
		}else{
			paramsCount = 1;
			addresses.push(queryObject.address);
		}
		var titlesHTML = "";
		if(paramsCount>0){
			async.each(addresses,
				function(address, callback){
					request(addProtocol(address), function(error, response, body){
						if(error){
							titlesHTML += "<li>"+ address +" - NO RESPONSE </li>";
						}else{
							$ = cheerio.load(body);
							titlesHTML += "<li>"+ address +" - "+ $('title').text() +"</li>";
						}
						callback();
					});
				},
				function(err){
					res.set('Content-Type', 'text/html');
					res.send(new Buffer('<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>'+titlesHTML+'</ul></body></html>'));
				}
			);
		}else{
			res.send("404 Not found");
		}
	}else{
		res.send("404 Not found");
	}
});

app.get('*', function(req, res){
	res.send("404 Not found");
});
app.listen(3000, () => console.log('Example app listening on port 3000!'))