var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var VideoExtractor=require("./Controller/handler.js");

http.createServer(async function(req, res){
    if(req.url === "/"){
        fs.readFile("WebContent/index.html", "UTF-8", function(err, html){
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        });
    }else if(req.url.match("\.css$")){
        var cssPath = path.join('WebContent', req.url);
        var fileStream = fs.createReadStream(cssPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/css"});
        fileStream.pipe(res);
    }else if(req.url.match("\.js$")){
        var jsPath = path.join('WebContent', req.url);
        var fileStream = fs.createReadStream(jsPath);
        res.writeHead(200, {"Content-Type": "text/javascript"});
        fileStream.pipe(res);
    }else if(req.url.match("\.png$")){
        var imagePath = path.join('WebContent', req.url);
        var fileStream = fs.createReadStream(imagePath);
        res.writeHead(200, {"Content-Type": "image/png"});
        fileStream.pipe(res);
    }else if(req.url.match("\.jpg$")){
        var imagePath = path.join('WebContent', req.url);
        var fileStream = fs.createReadStream(imagePath);
        res.writeHead(200, {"Content-Type": "image/jpg"});
        fileStream.pipe(res);
    }else if(req.url.match("\/getData") && req.method == 'GET'){
    	var pageURL = ''
		var output = {};
    	var queryParameters = url.parse(req.url, true).query;
    	pageURL = decodeURIComponent(queryParameters["&pageUrl"]);
		output = await VideoExtractor.extractVideoFromPage(pageURL);
		res.writeHead(200, {'Content-Type': 'application/json'});
    	res.end(JSON.stringify(output));
    }else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("No Page Found");
    }

}).listen(8080);