var youtubedl = require('youtube-dl');

var extract = async function extract(page){
	//cerco il link alla pagina youtube 
	var youtubeLink = await page.evaluate(() => {
		const node=document.querySelector("[href*='https://www.youtube.com/watch?v=']");
		if(node)
			return node.href ? node.href: null;
		else return null;
	});

	if(youtubeLink){
		var output={};
		youtubedl.getInfo(youtubeLink,[],{maxBuffer: 1000*1024}, function(err, info) {
			if(err){ 
				console.log("Youtube-dl internal ERROR");
			}else{
				output["url"]=info.url;
				output["title"]=info.title;
				output["duration"]=info.duration;
				output["upload_date"]=info.upload_date;
				output["resolution"]=info.format;
				output["description"]=info.description;
			}
		});
		await page.waitFor(10000);
		return output;
	}
}	
	
module.exports.extract = extract;

