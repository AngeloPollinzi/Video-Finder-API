const jsonHandler=require("./jsonHandler.js");

var extract = async function extract(page){
	/*Analizzatore dei metadati non strutturati per facebook open graph e twitter player stream e strutturati 
	 * per json+ld,microdata,RDFa
	 * */
	let output={};
	
	let scripts= await page.$$("script[type='application/ld+json']");
	for (const script of scripts) {
		var content = await page.evaluate(el => el.innerText, script);
		var json=jsonHandler.extractJSON(content);
		jsonHandler.getOutput(output,json);
		if(!jsonHandler.isEmpty(output))
			return output;
	}
	
	 output = await page.evaluate(() => {
		var res={};
		let metas= Array.from(document.querySelectorAll("meta,[itemtype='http://schema.org/VideoObject'] meta,[typeof='VideoObject'] meta"));
		
		metas.map( meta => {
			for (var i = 0; i < meta.attributes.length; i++) {
				if(meta.attributes[i]){
					var name= meta.attributes[i].name;
					var value= meta.attributes[i].value;
					
					if(value.startsWith("og:video")  && meta.attributes[i + 1]){
						if(value === "og:video" || value === "og:video:url" || value === "og:video:secure_url"){
							res["url"]= meta.attributes[i + 1].value;
						}else if(value === "og:video:type"){
							res["mime"]= meta.attributes[i + 1].value;
						}else if(value === "og:video:width"){
							res["width"]= meta.attributes[i + 1].value;
						}else if(value === "og:video:height"){
							res["height"]= meta.attributes[i + 1].value;
						}else if(value === "og:title"){
							res["name"]= meta.attributes[i + 1].value;
						}else if(value === "og:description"){
							res["description"]= meta.attributes[i + 1].value;
						}else if(value === "og:locale"){
							res["language"]= meta.attributes[i + 1].value;
						}else if(value === "og:video:duration" || value === "video:duration"){
							res["duration"]= meta.attributes[i + 1].value;
						}
					}else if(value.startsWith("twitter:player") && meta.attributes[i + 1]){
						if(value === "twitter:player:stream"){
							res["url"]=meta.attributes[i + 1].value;
						}else if(value === "twitter:player:width"){
							res["width"]=meta.attributes[i + 1].value;
						}else if(value === "twitter:player:height"){
							res["height"]=meta.attributes[i + 1].value;
						}else if(value === "twitter:title"){
							res["name"]=meta.attributes[i + 1].value;
						}else if(value === "twitter:description"){
							res["description"]=meta.attributes[i + 1].value;
						}
					}else if(meta.attributes[i + 1]){
						if(value.toLowerCase() === "contenturl"){
							res["url"]=meta.attributes[i + 1].value;
						}else if(value === "width"){
							res["width"]=meta.attributes[i + 1].value;
						}else if(value === "height"){
							res["height"]=meta.attributes[i + 1].value;
						}else if(value === "name"){
							res["name"]=meta.attributes[i + 1].value;
						}else if(value === "description"){
							res["description"]=meta.attributes[i + 1].value;
						}else if(value === "duration"){
							res["duration"]=meta.attributes[i + 1].value;
						}else if(value === "encodingFormat"){
							res["mime"]=meta.attributes[i + 1].value;
						}else if(value === "inLanguage"){
							res["language"]=meta.attributes[i + 1].value;
						}else if(value === "uploadDate"){
							res["uploadDate"]=meta.attributes[i + 1].value;
						}
					}
					
				}
			}
		});
		return res;
	});

	return output ;
}

module.exports.extract = extract;
