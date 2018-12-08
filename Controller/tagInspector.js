
// Tenta di trovare l'url cercando nel tag indicato dal selector
var extract = async function extract(page,selector,attribute){
	//cerco l'url nel selettore andando a prendere l'attributo specificato
	const video = await page.evaluate((selector,attribute) => {
		const videoElem=document.querySelector(selector);
		if(videoElem){
			if(attribute === 'src' && !videoElem.src.startsWith("blob:") && !videoElem.src.startsWith("data:"))
				return videoElem.src ? videoElem.src: null;
			else if(attribute === 'data' && !videoElem.data.startsWith("blob:") && !videoElem.data.startsWith("data:")){
				return videoElem.data ? videoElem.data: null;
			}
		}
		else return null;

	},selector,attribute);
	
	return video;

}

module.exports.extract = extract;

 
