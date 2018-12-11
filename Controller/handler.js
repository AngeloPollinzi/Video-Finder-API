const puppeteer = require('puppeteer');
const jsonHandler=require("./jsonHandler.js");
var extractor1=require("./tagInspector.js");
var extractor2=require("./youtube.js");
var extractor3=require("./javascriptInspector.js");
var extractor4=require("./dataAttributes.js");
var extractor5=require("./metadataInspector.js");
var HttpLogListener=require("./httpLogListener.js");
var videoplayer=require("./videoplayer.js");

var extractVideoFromPage = async function extractVideoFromPage(pageUrl){
	
	const result = await (async () => {
		
		let final_output;
		let all_outputs; 		//array dei risultati trovati
		
		// creo un'istanza di un browser chrome
		const browser = await puppeteer.launch({headless:false});
		
		// creo una nuova pagina nel browser
		const page = await browser.newPage();
		
		//visito la pagina contenente il video
		await page.goto(pageUrl,{waitUntil:'domcontentloaded',timeout: 0});

		// analisi statica sul DOM
		all_outputs = await analysis(page,0);
		final_output = await getFinal(all_outputs);
		//se il controllo statico fallisce provo faccio play 
		if(!final_output){
			await videoplayer.play(page);
			all_outputs = await analysis(page,1);
			final_output = await getFinal(all_outputs);
			
			if(!final_output){
				all_outputs = await analysis(page,0);
				final_output = await getFinal(all_outputs);
				if(!final_output){
					for (const frame of page.mainFrame().childFrames()){
						all_outputs = await analysis(frame,0);
						final_output = await getFinal(all_outputs);
						if(final_output)
							break;
					}
				}
			}
		}
		// quando ho finito chiudo il browser
		await browser.close();
		return final_output;
	})();
	
	return result;
}


async function analysis(doc,flag){
	
	let results;
	
	if(flag === 0){
		 results = await Promise.all([
			extractor1.extract(doc,"video","src"),
			extractor1.extract(doc,"video>source","src"),
			extractor1.extract(doc,"object[data*='.swf'],object[data*='.mp4'],object[data*='.ogg'],object[data*='.webm']","data"),
			extractor1.extract(doc,"iframe[src*='.mp4'],iframe[src*='.webm'],iframe[src*='.swf'],iframe[src*='.ogg']","src"),
			extractor1.extract(doc,"embed[src*='.mp4'],embed[src*='.webm'],embed[src*='.swf'],embed[src*='.ogg']","src"),
			extractor2.extract(doc),
			extractor3.extract(doc),
			extractor4.extract(doc),
			extractor5.extract(doc)
		]).then(outputs => { 
			return outputs;
		});
	}else if(flag === 1){
		var dynamicResults=[];
		HttpLogListener.listen(doc); 	
		await doc.waitFor(30000);					
		HttpLogListener.stop(doc);
		saveLogContentIn(dynamicResults);
		results = dynamicResults;
	}
	
	return results;
}

function saveLogContentIn(outputs){
	
	var lines = require('fs').readFileSync("log/outputs", 'utf-8').split('\n').filter(Boolean);
	for (let i = 0; i < lines.length; i++) {
		if(lines[i].startsWith("http")){
			outputs.push(lines[i]);
		}
		else{
			outputs.push(JSON.parse(lines[i]));
		}
	}
	var fs = require('fs');
	fs.truncate('log/outputs', function(){});
}

async function getFinal(outputs){
	for (let i = 0; i < outputs.length; i++) {
		if(outputs[i] && outputs[i].url)
			return outputs[i];
	}
	for (let i = 0; i < outputs.length; i++) {
		if(typeof outputs[i] == "string" && jsonHandler.containsVideoURL(outputs[i]))
			return outputs[i];
	}
}

module.exports.extractVideoFromPage = extractVideoFromPage ;