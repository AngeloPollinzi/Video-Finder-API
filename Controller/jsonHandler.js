var extractJSON = function extractJSON(str) {
    var firstOpen, firstClose, candidate;
    firstOpen = str.indexOf('{', firstOpen + 1);
    do {
        firstClose = str.lastIndexOf('}');
        if(firstClose <= firstOpen) {
            return null;
        }
        do {
            candidate = str.substring(firstOpen, firstClose + 1);
            try {
            	if(containsVideoURL(candidate)){
            		var res = JSON.parse(candidate);
            		return [res, firstOpen, firstClose + 1];
            	}
            }
            catch(e) {
            }
            firstClose = str.substr(0, firstClose).lastIndexOf('}');
        } while(firstClose > firstOpen);
        firstOpen = str.indexOf('{', firstOpen + 1);
    } while(firstOpen != -1);
}

var dateTests = ["datepublished","uploaddate","lastmodified","createdate","pubdate"];
var nameTests = ["headline","title","name"];
var mimeTests = ["video/","application/","mime","format"];
var descriptionTests = ["description","caption"];

var re1 = new RegExp(dateTests.join("|"), "i");
var re2 = new RegExp(nameTests.join("|"), "i");
var re3 = new RegExp(mimeTests.join("|"), "i");
var re4 = new RegExp(descriptionTests.join("|"), "i");
var re5 = new RegExp("https?[:/]+(www\\.)?[-\\]_\\.~!\*'();:@&=+$,\\/?%#\\[A-z0-9]+\\.(?:mp4|webm|ogg)[-\\]_\\.~!\\*'();:@&=+$,\\/?%#\\[A-z0-9]*");
var re6 = new RegExp("[A-Za-z]{2}");
//funzione ricorsiva che va a visitare la struttura di obj(JSON) per eventualmente salvare le informazioni utili nel campo output
var getOutput = function getInfo(output,obj){
	
	for(var key in obj){
		if(obj.hasOwnProperty(key) && typeof obj[key] == "object" && obj[key]){
			getInfo(output,obj[key]);
		}else if(obj.hasOwnProperty(key) && typeof obj[key] != "object" && obj[key]){
			if(re5.test(obj[key]) && !output.url){
				output["url"] = obj[key];
			}else if(re1.test(key) && !output.uploadDate){
				output["uploadDate"] = (new Date(obj[key])).toJSON();
			}else if(re2.test(key) && typeof obj[key] == "string" && !output.name){
				output["name"] = obj[key];
			}else if(key === "duration" && !output.duration){
				output["duration"] = obj[key];
			}else if(key.match(/width/i) && !output.width && isValid(obj[key])){
				output["width"] = obj[key];
			}else if(key.match(/height/i) && !output.height && isValid(obj[key])){
				output["height"] = obj[key];
			}else if(re3.test(key) && !output.mime){
				output["mime"] = obj[key];
			}else if(re4.test(key) && !output.description){
				output["description"] = obj[key];
			}else if(key.match(/lang/i) && re6.test(obj[key]) && !output.language){
				output["language"] = obj[key];
			}
		}
	}

}

var containsVideoURL = function containsVideoURL(text){
	return text.match(/https?[:/]+(www\.)?[-\]_\.~!\*'();:@&=+$,\/?%#\[A-z0-9]+\.(?:mp4|m3u8|webm|ogg)[-\]_\.~!\*'();:@&=+$,\/?%#\[A-z0-9]*/);
}

function isValid(value){
	
	if(typeof value == "string"){
		var num = parseInt(value );
		return num >= 100 && num <= 2000;
	}
	
	return value >= 100 && value <= 2000;
}

var isEmpty = function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
}

module.exports.containsVideoURL = containsVideoURL;
module.exports.getOutput = getOutput;
module.exports.isEmpty = isEmpty;
module.exports.extractJSON = extractJSON;
