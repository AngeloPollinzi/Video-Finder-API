const puppeteer = require('puppeteer');
const jsonHandler=require("./jsonHandler.js");
var extractor1=require("./tagInspector.js");
var extractor2=require("./youtube.js");
var extractor3=require("./javascriptInspector.js");
var extractor4=require("./dataAttributes.js");
var extractor5=require("./metadataInspector.js");
var HttpLogListener=require("./httpLogListener.js");
var videoplayer=require("./videoplayer.js");

const urls = [
//	'http://widgets.digitalmediacommunications.com/widget/embed/index/?p=1221&k=sta',
//	'https://www.wokv.com/video/hot-video/worldwide-search-underway-for-rare-blood-type-save-toddler-with-cancer/pS1ULChdFktcdxw5zgJVEI/',
//	'https://www.chicagomaroon.com/article/2018/11/13/grammy-winning-third-year-releases-music-video-par/',
//	'http://keyw.com/check-out-a-locally-produced-video-of-pasco-then-and-now/',
//	'https://www.epluribusloonum.com/2018/10/28/18035878/video-the-5-best-games-of-minnesota-uniteds-2018-season-major-league-soccer',
	'https://www.benarnews.org/english/Video',
	'http://www.bpnews.net/videos/',
	'https://www.healthyway.com/content/no-excuses-10-times-dwayne-johnsons-instagram-videos-got-our-butts-to-the-gym/',
	'http://sandhillsexpress.com/local-news/heavy-snow-and-slush-blanketing-broken-bow/',
	'https://www.actionnewsjax.com/video?videoId=883025791&videoVersion=1.0',
	'http://video.nationalmemo.com/',
	'http://hungrylobbyist.com/video-nationals-clinch-the-nl-east-championship/',
	'http://2politicaljunkies.blogspot.com/2018/11/happy-thanksgiving.html',
	'https://970wfla.iheart.com/content/2018-12-04-shocking-video-shows-florida-trooper-get-hit-by-car-on-busy-highway/',
	'http://abbafirst.com/news/say-goodbye-to-fannie-and-freddie/',
	'http://abbafirst.com/news/say-goodbye-to-fannie-and-freddie/',
	'http://accesswdun.com/article/2018/12/741123/video-athlete-of-the-week-gwynns-play-has-chestatee-at-6-1',
	'https://www.adelnews.com/videos',
	'https://adventuremomblog.com/unique-holiday-experiences-kentucky/',
	'http://www.worldstarhiphop.com/videos/video.php?v=wshh9KBUsT56yOh6g1w8',
];


// mi metto in ascolto
(async () => {
	
	const width = 1024;
	const height = 1600;
	
	// creo un'istanza di un browser chrome
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport : { 'width' : width, 'height' : height },
	});
	
	// creo una nuova pagina nel browser
	const page = await browser.newPage();
	
	let all_outputs; 		//array dei risultati trovati
	let final_output;
	// man mano passo i miei url agli estrattori che mi restituiranno il
	// risultato
	for (let i = 0; i < urls.length; i++) {
	
		const url = urls[i];
		
		await page.goto(url,{waitUntil:'domcontentloaded',timeout: 0});

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
		
//		for(const o of all_outputs){
//			if(o)
//			console.log(o);
//		}
		console.log(final_output);
		console.log("===============================================================================");
		
	}
	// quando ho finito chiudo il browser
	await browser.close();
})();


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
	
	var lines = require('fs').readFileSync("../log/outputs", 'utf-8').split('\n').filter(Boolean);
	for (let i = 0; i < lines.length; i++) {
		if(lines[i].startsWith("http")){
			outputs.push(lines[i]);
		}
		else{
			outputs.push(JSON.parse(lines[i]));
		}
	}
	var fs = require('fs');
	fs.truncate('../log/outputs', function(){});
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
