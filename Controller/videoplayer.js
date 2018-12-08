//analizza la pagina e cerca di trovare il video per farlo partire
var play = async function play(page){

	const video=await page.$('video');
	
	if(video){
		video.click();
		return;
	}

	const selectors=[];
	selectors.push("div[class*='video']");
	selectors.push("div[class*='play']");
	selectors.push("figure[class*='video']");
	selectors.push("figure[class*='play']");
	selectors.push("img[class*='video']");
	selectors.push("img[class*='play']");
	
	await page.evaluate((selectors) => {
		var largestElem;  // l'elemento piu' grande
			//funzione che va a restituire un array ordinato in modo crescente in base alle dimensioni
			function scanSizes(root) {
				return [].map.call(root, function(node) {
					var bounds = node.getBoundingClientRect();
					return node;
				}).sort(function(x, y) {
					var a = x.area, b= y.area;
					return a > b ? -1 : a < b ? 1 : 0;
				});
			}
			for (let i = 0; i < selectors.length; i++) {
				var elements=document.querySelectorAll(selectors[i]);
				var sizes;
				if(elements){
					sizes=scanSizes(elements);
					largestElem = sizes[0];
					if(largestElem){
						largestElem.click();
						return ;
					}
				}
			}
	}, selectors );
}

module.exports.play= play;

