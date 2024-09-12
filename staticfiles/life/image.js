import {svg, fadeIn, fadeOut, fontOpacityZeroToFull, fadeTime, grow} from './animation.js';
import {fullWindow, nextImageFullWindow} from './fullWindowImage.js';

const body = document.querySelector('body');

function displayImages(allImageSources, GBIFResult, originOfCall, y)
{
	console.log(allImageSources);
	const r = GBIFResult;
	const allImages = r.imagesObject;
	
	let counter = 0;
	let unlockPushRight = true;
	let unlockAddImage = true;
	
	checkWidth();
	async function checkWidth() // automatically fills the horizontal space with images when clicking on a GBIF rank object.
	{
		if (((r.images.scrollWidth === r.images.offsetWidth && r.images.scrollWidth !== 0 && r.images.offsetWidth !== 0) || originOfCall === 'MEDIA') && counter < allImageSources.links.length)
		// it will always load all MEDIA images, which, if there are any, are usually just two or three images.
		// ...but it will dynamically add OCCURRENCE (simultaneously): for as long as the content fills less than the width of the div (r.images, minus padding) it appears in: scrollWidth has the width of offsetWidth (= there's no scrolling). Only if content takes more space than its div, then: scrollWidth > offsetWidth. So we assume that if offset and scroll are the same, it means that not enough images have loaded yet to fill the horizontal space.
		// the !== 0 condition is important because if you open the GBIF and then quickly close it (before scrollWidth becomes more than offsetWidth) both, scrollWidth and offsetWidth are === 0 again, fulfilling the first condition, and thus fetching OCCURRENCE images forever into a closed GBIF result.
		{
			if (originOfCall === 'OCCURRENCE') console.log("TRYING TO AUTO-ADD OCCURRENCE IMAGES");
			else console.log("TRYING TO AUTO-ADD MEDIA IMAGES");
			let foundImage = await addNextImage();
			if (!foundImage) setTimeout(checkWidth,500); // it's false if unlockAddImage is false in addNextImage(), and will fall through the function instantly, returning to here. The setTimeout prevents a fast cpu-hijacking loop.
			else checkWidth();
		}
	}
	r.images.onscroll = ()=> // loads more images whenever the user scrolls to right limit.
	{
		// console.log("scrollWidth: "+r.images.scrollWidth);
		// console.log("offsetWidth "+r.images.offsetWidth);
		// console.log("scrollLeft: "+Math.round(r.images.scrollLeft));
		
		if (unlockPushRight && r.images.offsetWidth + r.images.scrollLeft +1 >= r.images.scrollWidth && counter < allImageSources.links.length) // unlockPushRight is a necessity because whenever you scroll to the right border (and keep pressing against it), this listener fires a addNextImage() call, which stacks up to many concurrent calls within split seconds. ...the +1 pixel is probably a necessity as the numbers may not always perfectly add up (scrollLeft produces wild floating points).
		{
			unlockPushRight = false;
			addNextImage();
		}
	}
	
	async function addNextImage()
	{
		if (unlockAddImage) // this prevents concurrent calls from preview mode and full-window mode, which would cause it to load the same image multiple times: The user pushes right in the preview mode and triggers a fetch, and while it is still loading clicks on the latest image and clicks on arrowRight in full-window mode, triggering the same call.
		{	
			unlockAddImage = false;
			while(true)
			{
				while (allImageSources.links[counter] === undefined) counter++; // there shouldn't be any undefineds coming from fetch.js, but safer is safer
				let theReturn = await getImage();
				if (counter < allImageSources.links.length) unlockPushRight = true;
				if (r.images.offsetWidth === 0 || !r.resultOpened) break; // user has closed the GBIFResult
				if (theReturn) break;
				console.log("RETURN IS FALSE. TRYING NEXT ONE.");
			}
			unlockAddImage = true;
			return true;
		}
		return false;
	}
	
	async function checkCurrentlyFetching()
	{
		await new Promise(resolve => setTimeout(resolve,100));
		return unlockAddImage;
	}
	
	async function getImage()
	{
		let gotImage = true;

		if (Array.prototype.indexOf.call(r.images.children, svg) === -1)
		{
			r.images.append(svg);
			svg.animate(fadeIn, fadeTime);
		} // if not -1, it means it didn't fetch an image in the previous getImage() call, so is still in the addNextImage() loop (animation fades out and gets removed when theImage is an image (is not false)). If it wasn't for this if-check, the animation would slightly flicker, as for every image-link-404 when it runs through here, it's (re)appending and fading-in the animation that is actually already there. Purpose of this if-check: while addNextImage loops through 404s, the animation stays a continuous loading animation until it finds an image.
		r.images.scrollLeft = r.images.scrollWidth-r.images.offsetWidth-2; // makes the loading animation visible / moves the scroll (almost) to right end.
		
		console.log("FETCHING IMAGE");
		let moment = new Date().getTime();
		const theImage = await downloadImage(allImageSources.links[counter]);
		console.log("FETCHING DONE! After "+(new Date().getTime() - moment)+"ms");
		
		// console.log(Object.prototype.toString.call(theImage));
		// console.log(theImage instanceof Error) // previous design. It now just returns a false.

		if (!(!theImage)) await waitForAni();
		else
		{
			console.log('NO IMAGE RETRIEVED');
			gotImage = false;
			if (counter > allImageSources.links.length-2) svg.animate(fadeOut, fadeTime).onfinish = ()=>svg.remove(); // this is for the rarer case that last link didn't yield an image, so it has to close the animation here, instead of in waitForAni().
		}
		
		async function waitForAni()
		{
			const thePromise = new Promise(resolve => svg.animate(fadeOut, 200).onfinish = resolve);
			await thePromise;
			svg.remove();
			// the interpreter doesn't wait for .onfinish.
			// earlier I had all the code beneath be within an anonymous function attached to '.onfinish'. Animations are asynchronous, the interpreter just moves on. This worked as long as it was downloading the images, meaning they took enough time to arrive for the 333ms fade animation of the loading animation, but it would become iffy when images have been cached by the browser before. Let's say there are 20 images coming from fetch.js, it would run through getImage 20 times, each image taking around 10ms - 20ms with an SSD to be called from the cache. Placing console.logs revealed that all the content in this if-statement would stack up 20 times, then be called long after all the getImage runtimes were closed. So yes, yet another async function. All it does is waiting for the animation. This is important to have svg.remove() happen before image appears.
			
			// image.src gets added to an array for full-window display (r.imagesObject.images). Image in r.images and on full-window display demand different display attributes. The browser will know that it is the same cached image (and not download it a second time).

			if (originOfCall === 'MEDIA') // MEDIA images added to the left end, OCCURRENCES to the right.
			{
				r.imagesObject.images.unshift(theImage.src);
				r.imagesObject.mediaCount++;
				r.images.prepend(theImage);
			}
			else
			{
				r.imagesObject.images.push(theImage.src);
				r.imagesObject.occurrencesCount++;
				r.images.append(theImage);
			}
			
			theImage.classList.add('resultImage');
			theImage.style['border-color'] = allImageSources.colors[counter];
			theImage.style['outline-color'] = allImageSources.colors[counter];
			if (!touch) renderImageText(theImage, allImageSources.descriptions[counter], allImageSources.colors[counter]);
			clickOnImage(theImage, GBIFResult, originOfCall);
			
			theImage.animate({transform: ['scale(0.9)','scale(1)'], opacity: [0,1]}, fadeTime).onfinish = ()=> theImage.style.opacity = 1;
			r.images.scrollLeft = r.images.scrollWidth-r.images.offsetWidth-2; // automatically moves the scrollbar to the right end minues 2px (or it would trigger the next download).
			return true;
		}
		
		counter++;
		
		if (counter > allImageSources.links.length-1 && originOfCall === 'MEDIA')
		{
			console.log("ALL "+taxaKeys[y].toUpperCase()+" MEDIA IMAGES URLS FETCHED! (Downloaded "+r.imagesObject.mediaCount+" images from "+allImageSources.links.length+" urls).");
			gotImage = true;
		}
		if (counter > allImageSources.links.length-1 && originOfCall === 'OCCURRENCE')
		{
			console.log("ALL OCCURRENCE IMAGE URLS FETCHED! (Downloaded "+r.imagesObject.occurrencesCount+" images from "+allImageSources.links.length+" urls).");
			r.imagesObject.downloadedAllOccurrences = true;
			gotImage = true;
		}	
		return gotImage;
	}
	
	async function downloadImage(address) // The purpose of this async func is to make getImage() wait for fully loaded images.
	{
		const image = g('i');
		const thePromise = new Promise(resolve =>
		{	
			let timeout;
			if (originOfCall === 'OCCURRENCE') // MEDIA images are allowed to take longer (and often do), they can be big. What matters is that occurrence images keep coming in.
			{
				const start = new Date().getTime();
				timeout = setInterval(()=>
				{
					if (new Date().getTime() - start > 15000)
					{
						resolve(); // this is for slow servers that neither send an error nor (seemingly) an image. The image may be pre/appended half-loaded (and half visible) to r.images after 15 secs and will keep loading until finished, but at least the app moves on to the next one already.
						console.log('TIMEOUT after 15 sec');
						clearInterval(timeout);
					}
				},100);
			}
			image.src = address;
			image.onload = ()=> {resolve(); if (originOfCall === 'OCCURRENCE') clearInterval(timeout);}
			image.onerror = ()=> {resolve(); if (originOfCall === 'OCCURRENCE') clearInterval(timeout);} // when the image address is a 40X. If it was only image.onload, it would just wait forever; "empty" images are handled in the if-statement after the fulfilled promise.
		});
		await thePromise;
		if (image.naturalWidth === 0) return false;
		else return image;
	}
	
	if (originOfCall === 'OCCURRENCE' && allImageSources.links.length > 0)
	{
		r.imagesObject.functionAddNextOccurrence = addNextImage;
		r.imagesObject.functionCheckCurrentlyFetching = checkCurrentlyFetching;
	}
	if (originOfCall === 'OCCURRENCE' && allImageSources.links.length === 0)
	{
		r.imagesObject.downloadedAllOccurrences = true;
		console.log("NO OCCURRENCES PRESENT FOR SPECIES "+r.species.canonicalName);
	}
	if (originOfCall === 'MEDIA' && allImageSources.links.length === 0)
	{
		console.log("NO MEDIA PRESENT FOR "+r[targetRank].canonicalName);
	}
}

function renderImageText(theImage, theText, frameColor)
{
	const renderedText = g();
	renderedText.classList.add('imageDescription');
	renderedText.style['background-color'] = frameColor;
	renderedText.innerHTML = theText;
	body.append(renderedText);
	
	if (renderedText.innerHTML !== "" ) renderedText.innerHTML += "<br><br>";
	renderedText.innerHTML += "<strong>Image</strong><br>Dimensions: "+theImage.naturalWidth+"px "+theImage.naturalHeight+"px<br>Aspect Ratio: "+(theImage.naturalWidth/theImage.naturalHeight).toFixed(2);
	
	let isHovering = false;
	
	/*window.onmousemove = (mouse)=>
	{
		//console.log("Mouse Y: "+(mouse.clientY+window.scrollY));
		//console.log("Mouse X: "+mouse.clientX);
	}*/
	// body.onclick = ()=>{ showCoordinates(event);}
	/* function showCoordinates(event)
	{
		console.log("MOUSE X: " + event.clientX + ", Y: " + (event.clientY+window.scrollY));
	}*/
	
	theImage.onmousemove = (mouse)=>
	{
		// console.log("mouse position:", mouse.clientX, mouse.clientY);
		renderedText.style.top = mouse.clientY+window.scrollY-renderedText.clientHeight/2+10+'px';
		renderedText.style.left = mouse.clientX+50+'px';
	}
	renderedText.onmousemove = (mouse)=> // it is possible to move the mouse quicker than rendering happens sometimes, causing the mouse to hover over the rendered text-div, esp from quick left-to-right movements (as the div appears right of the mouse). The runtime then thinks the mouse is not hovering over the image anymore and triggers an image-mouseout. This will start a loop of mouseover-mouseout which will result in an endless flicker-effect (element on/off loop). So this listener will set the div next to the mouse should the mouse touch it.
	{
		renderedText.style.top = mouse.clientY+window.scrollY-renderedText.clientHeight/2+10+'px';
		renderedText.style.left = mouse.clientX+50+'px';
	}
	
	theImage.onmouseover = ()=>
	{
		isHovering = true;
		renderedText.style.display = 'block';
		theImage.style['cursor'] = 'cell';
		renderedText.style.color = 'rgba(255, 255, 255, 0)';
		renderedText.animate(fadeIn, 200).onfinish = ()=> {renderedText.style.opacity = 1; renderedText.animate(fontOpacityZeroToFull(255,255,255,true), 200).onfinish= ()=> renderedText.style.color = 'rgba(255, 255, 255, 1)';};
	}
	theImage.onmouseout = ()=>
	{
		isHovering = false;
		theImage.style['cursor'] = 'auto';
		renderedText.animate(fadeOut, 200).onfinish = () =>
		{
			renderedText.style.opacity = 0;
			if (!isHovering) renderedText.style.display = 'none'; // if you make quick movements leaving the image surface and going over it again, you may be back on the image surface under 200ms. So if it wasn't for this if-check it would then make display= none, even if you were hovering again.
		}
	}
}

function clickOnImage(theImage, GBIFResult, originOfCall)
{
	if (touch) // for mobile, it's its whole image-full-screen implementation. Meaning no fullWindowImage.js for touch === true.
	{
		if (GBIFResult.mobileFullWidthImage.src === theImage.src) return; 
		let trackX = 0;
		let trackY = 0;
		theImage.ontouchstart = (event)=>
		{
			trackX = event.changedTouches[0].clientX;
			trackY = event.changedTouches[0].clientY;
		}
		theImage.ontouchend = (event)=>
		{
			let deltaX = event.changedTouches[0].clientX - trackX;
			let deltaY = event.changedTouches[0].clientY - trackY;
			if ((deltaX > 10 || deltaX < -10) || (deltaY > 10 || deltaY < -10)) return; // user didn't just tap but actually moved the finger (scrolled, pinched...)
			
			GBIFResult.mobileFullWidthImageDiv.style.display = 'block';
			GBIFResult.mobileFullWidthImage.src = theImage.src;
			GBIFResult.mobileFullWidthImage.animate({opacity:[0,1],scale:[0.85,1]},500);
			if (theImage.naturalWidth > GBIFResult.mobileFullWidthImageDiv.getBoundingClientRect().width) GBIFResult.mobileFullWidthImage.style.width = GBIFResult.mobileFullWidthImageDiv.getBoundingClientRect().width+'px'; // there didn't seem to be a CSS way to contain the image neatly within the parent div.
			else GBIFResult.mobileFullWidthImage.style.width = theImage.naturalWidth+'px';
			//GBIFResult.mobileFullWidthImage.style['border-color'] = `hsl(${GBIFResult.species.color}, 60%, 60%)`;
			//GBIFResult.mobileFullWidthImage.style['outline-color'] = `hsl(${GBIFResult.species.color}, 60%, 60%)`;
			window.addEventListener('resize', ()=> // flipping screen
			{
				if (theImage.naturalWidth > GBIFResult.mobileFullWidthImageDiv.getBoundingClientRect().width) GBIFResult.mobileFullWidthImage.style.width = GBIFResult.mobileFullWidthImageDiv.getBoundingClientRect().width+'px';
			});
		}
	}
	else theImage.onclick = ()=> nextImageFullWindow(true, 0, Array.prototype.indexOf.call(GBIFResult.images.children, theImage), GBIFResult);
	
	if (fullWindow.style.display === 'block' && originOfCall === 'MEDIA') nextImageFullWindow(false, 1); // automatically prepends MEDIA image without user noticing it when you're in fullWindow mode.
}

export{displayImages};