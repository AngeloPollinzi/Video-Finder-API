var jsonHandler=require("./jsonHandler.js");

var extract= async function extract(page){
	const scripts=await page.$$('script');

	var output={};
	for (const script of scripts) {
	    var textContent = await page.evaluate(el => el.innerText, script);
	    try{
		    if(textContent && jsonHandler.containsVideoURL(textContent)){
				var content=jsonHandler.extractJSON(textContent);
				jsonHandler.getOutput(output,content);
				if(!jsonHandler.isEmpty(output))
					return output;
				else{
					var url = textContent.match(/(https?[:/]+(www\.)?[-\]_\.~!\*'();:@&=+$,\/?%#\[A-z0-9]+\.(?:mp4|m3u8|webm|ogg)[-\]_\.~!\*'();:@&=+$,\/?%#\[A-z0-9]*)/)[0];
					if(url)
						return url;
				}
		    }
	    }catch(err){
	    	console.log("----------------Javascript Inspector ERROR-------------------------");
	    	console.log(err);
	    }
	}
	return output;
}

module.exports.extract = extract;