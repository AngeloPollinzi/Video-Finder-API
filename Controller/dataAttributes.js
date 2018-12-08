const jsonHandler=require("./jsonHandler.js");

var extract = async function extract(page){
//vado a selezionare tutti i div nella pagina e succesivamente analizzo gli attributi di
// ognuno alla ricerca di un attributo che inizi con "data-", caratteristica dei data attributes.
	const divs=await page.$$("div");

	if(divs){
		for(const div of divs){
			await page.evaluate(elem =>{
				if(elem){
					for (var i = 0; i < elem.attributes.length; i++) {
						var attrib = elem.attributes[i];
						if(attrib.name.startsWith('data-') && attrib.value.match(/https?[:/]+(www\.)?[-\]_\.~!\*'();:@&=+$,\/?%#\[A-z0-9]+\.(?:mp4|m3u8|webm|ogg)[-\]_\.~!\*'();:@&=+$,\/?%#\[A-z0-9]*/)){
							elem.setAttribute("secretword","word");
						}
					}
				}
			},div);
		}
	}
	
	const data = await page.evaluate(() => {
		var values=[];	
		var sizes = scanSizes(document.querySelectorAll("[secretword='word']"));
		if(sizes[0]){
			for (var i = 0; i < sizes[0].attributes.length; i++) {
				var attrib = sizes[0].attributes[i];
				if(attrib.name.startsWith('data-')){
					values.push(attrib.value);
				}
			}
		}
		return values;
		
		function scanSizes(root) {
			return [].map.call(root, function(node) {
				var bounds = node.getBoundingClientRect();
				return node;
			}).sort(function(x, y) {
				var a = x.area, b= y.area;
				return a > b ? -1 : a < b ? 1 : 0;
			});
		}
	});
	
	var output={};
	
	for(const item of data){
		if(item && jsonHandler.containsVideoURL(item)){
			var jsonformat= jsonHandler.extractJSON(item);
			jsonHandler.getOutput(output,jsonformat);
			return output;
		}
	}
	
}

module.exports.extract = extract;
