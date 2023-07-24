import {svg2, fadeIn, fadeOut, imageFadeIn, imageFadeOut, fadeTime} from './animation.js';
import {touch, isMobile} from './startup.js';
import touchResponse from './mobileResponsiveness.js';

const body = document.querySelector('body');

// AN OVERLAY-BACKGROUND FOR DISPLAYING IMAGES FULL WINDOW
const fullWindow = document.createElement('div');
fullWindow.id = 'fullWindow';
body.append(fullWindow);
fullWindow.addEventListener('wheel', (event)=>
{
	if (event.deltaY > 0) goRight();
	else goLeft();
});

// THE FULL-WINDOW IMAGE
const fullWindowImage = document.createElement('IMG'); // the fullWindow mode only has one image, of which the src gets changed on changing the image.
fullWindowImage.id = 'fullWindowImage';
fullWindow.append(fullWindowImage);

// NAVIGATION INTERACTION
const arrow = document.createElement('div');
arrow.classList.add('fullWindowImageNavigationArrow');
const arrowLeft = arrow.cloneNode();
const arrowRight = arrow.cloneNode();
arrowLeft.style['z-index'] = 3; 
arrowRight.style['z-index'] = 4; 
arrowLeft.innerHTML = '⪡';

//if (!touch && touch !== undefined) // because of module hoisting this if check will be executed before it'll know about 'touch' which is in the module that is executed last on page-load: the origin module where the script starts (startup.js).
//{
	arrowLeft.style.left = '5%';
	arrowRight.style.left = '95%';

	arrowLeft.onmouseover = ()=> {arrowLeft.style.cursor = 'pointer'; arrowLeft.style.color = 'deepskyblue';}
	arrowRight.onmouseout = ()=>
	{
		arrowRight.style.color = 'white';
		arrowRight.style.cursor = 'default';
	};
	arrowLeft.onmouseout = ()=>
	{
		arrowLeft.style.color = 'white';
		arrowLeft.style.cursor = 'default';
	};
	arrowLeft.addEventListener('click', ()=> goLeft());
	arrowRight.addEventListener('click', ()=> goRight());
/*}
else
{
	touchResponse([arrowLeft,arrowRight], goLeft, goRight);
	arrowPlacements();
}

function arrowPlacements()
{
	arrowLeft.style.left = '100px';
	arrowRight.style.left = window.screen.width-100+'px';
}
*/
fullWindow.append(arrowRight, arrowLeft)

/*
const escapeBorder = document.createElement('div');
escapeBorder.id = 'escapeBorder';
escapeBorder.style['z-index'] = 3;*/
const escape = document.createElement('div');
escape.id = 'escape';
escape.innerHTML = '⊙';
escape.onmouseover = ()=>
{
	escapeBorder.style.border = '3px solid orange';
	escapeBorder.style.width = '50px';
	escapeBorder.style.height = '50px';
};
escape.onmouseout = ()=>
{
	escapeBorder.style.border = '2px solid white';
	escapeBorder.style.width = '45px';
	escapeBorder.style.height = '45px';
};
escape.onclick = ()=> leaveFullWindow();
svg2.id = 'svg2';
fullWindow.append(svg2, escape/*,escapeBorder*/);

// KEY LISTENER FOR FULL WINDOW 
window.addEventListener('keydown', (event)=>
{
	let key = event.keyCode || event.which;

	const escape = 27;
	const arrowLeftKey = 37;
	const arrowRightKey = 39;
	
	if(fullWindow.style.display === 'block')
	{
		if (key === escape) leaveFullWindow();
		if (key === arrowLeftKey) goLeft();
		if (key === arrowRightKey) goRight();
	}
});

// SETTING UP THE OVERLAY-BACKGROUND
function goFullWindow()
{
	body.style.overflow = 'hidden';
	presentObject.images.style.overflow = 'hidden';
	// if body overflow = hidden comes somewhere after fullWindow style = block , fullWindow may end up being placed somewhat vertically off, like 40 or 100px (further down). That happened when clicking on images of multiple GBIF results. ... this bug was hard to track down.
	fullWindow.style.display = 'block';
	fullWindow.animate(fadeIn, fadeTime);
	fullWindowPlacements();
}

function leaveFullWindow()
{
	fullWindow.animate(fadeOut, fadeTime/1.5).onfinish = ()=>
	{
		fullWindow.style.display = 'none';
		body.style.overflow = 'auto';
		presentObject.images.style.overflow = 'auto';
		/*if (isMobile)
		{
			if (window.innerHeight > window.innerWidth) body.style.zoom = 2;
			else body.style.zoom = 1.2;
		}*/
	};
}

function fullWindowPlacements()
{
	/*if (isMobile)
	{
		body.style.zoom = 1;
		fullWindow.style.width = window.innerWidth+'px';
		fullWindow.style.height = window.innerHeight+'px';
		svg2.style.left = '50%';
		fullWindow.style.top = window.pageYOffset+'px';
		let thereYouGo = window.pageYOffset;
		alert(fullWindow.style.top);
		window.scrollTo(0, thereYouGo);
		setTimeout(()=>window.scrollTo(0, thereYouGo),500);
	}
	else
	{*/
		fullWindow.style.top = window.scrollY+'px';
		svg2.style.left = '95%'; // replacing it every time is necessary as otherwise it would keep drifting away every time the user opens fullWindow due to the extra pixels I add in the lines below (at end of line).
		svg2.style.top = svg2.getBoundingClientRect().y+svg2.getBoundingClientRect().height/2+4+'px'; // Depending on the font you use, the arrow will be located a few pixels elsewhere. The 'height/2' is to counter-act the translate -50%.
		svg2.style.left = svg2.getBoundingClientRect().x+svg2.getBoundingClientRect().width/2-4+'px';
		//escapeBorder.style.left = '95%';
		//escapeBorder.style.left = escapeBorder.getBoundingClientRect().x+escapeBorder.getBoundingClientRect().width/2-0.5+'px';	
	//}
	svg2.style.top = '50%';
}

fullWindowNavigationStates(); // to initialize, to trigger the first four styling attributes
function fullWindowNavigationStates(state)
{
	if (touch) return;
	// initially it always sets this state: not at end, not at beginning of images
	arrowRight.style.opacity = 1;
	arrowLeft.style.display = 'block';
	arrowRight.innerHTML = '⪢';
	arrowRight.onmouseover = () => {arrowRight.style.cursor = 'pointer'; arrowRight.style.color = 'deepskyblue';}
	
	// ... which may be overwritten / adjusted by a following state.
	if (state === "atBeginning") arrowLeft.style.display = 'none';
	if (state === "atEndDownloadMore")
	{
		arrowRight.style.opacity = 0.3;
		arrowRight.onmouseover = () => {arrowRight.style.cursor = 'default'; arrowRight.style.color = 'white';}
	}
	if (state === "atEndNoMoreDownloads")
	{
		arrowRight.innerHTML = '▣';
		arrowRight.onmouseover = () => {arrowRight.style.cursor = 'default'; arrowRight.style.color = 'white';}
	}
	if (state === "onlyOneImage")
	{
		arrowLeft.style.display = 'none';
		arrowRight.innerHTML = '▣';
		arrowRight.onmouseover = () => {arrowRight.style.cursor = 'default'; arrowRight.style.color = 'white';}
	}
}

// 'present' means 'global' within this module. But since 'global' usually means app-wide, it's 'present' here.
var presentImageIndex = 0;
var presentImgObject = null;
var presentObject = null;
var lockedFetchNext = false;

async function goRight()
{
	if (presentImageIndex >= presentImgObject.images.length-1 && !presentImgObject.downloadedAllOccurrences)
	{
		if (!lockedFetchNext) // why is lockedFetchNext === false not part of the parent if condition? Because the interpreter must be prohibited to move over to the else-ifs while lockedFetchNext is true (fetching image) WHILE ALSO presentImageIndex is at right end. So it should just return from this function at the child-if condition not being met. Earlier, while the child if was part of the parent-if, it may have happened that this function is called repeatedly within a fraction of a moment with the last else-if (almost) at the same time is this if-statement, causing a mix-up and allowing presentImageIndex === presentImgObject.images.length; out of bounds in displayImageFullWindow: img.src is undefined. It was an error difficult to track and probably had to do with the timing of the update of GBIFResult.imagesObject, allowing the last else if-condition to be met sometimes while this one was still in lock. Back then I also used presentImageIndex++ in this if statement instead of just setting it to the end of length, which is safer. So there may have been two concurrent presentImageIndex++s from here and the last else-if. ... It was pretty stable, it would never go beyond index === length, and the user wouldn't even have noticed the error, as the object update (and index update) would soon follow and you could just keep on moving through the images. But the src-undefined error appeared in the log, I wanted to understand it and now it's even more watertight.
		{
			lockedFetchNext = true;
			presentImageIndex = presentImgObject.images.length-1; 
			fullWindowNavigationStates('atEndDownloadMore');
			svg2.animate(fadeIn, fadeTime).onfinish = ()=> svg2.style.opacity = 1;
			const theReturn = await presentImgObject.functionAddNextOccurrence();
			if (!theReturn) while(!(await presentImgObject.functionCheckCurrentlyFetching())) console.log('addNextImage() IS IN LOCK!'); // this check-loop alls the svg2 to keep animating while the new image is being fetched. This case happens if it is triggered by scrolling right in the opened GBIFResult, and then clicking on the latest image (opening fullWindow) trying to go right in fullWindow. If it wasn't for this check, svg2 would just appear for a short flicker moment and then disappear as theReturn is a false. In other words: both, svg and svg2 are synchronized and appear for the same time.
			svg2.animate(fadeOut, fadeTime).onfinish = ()=> svg2.style.opacity = 0;
			lockedFetchNext = false;
			if (presentImageIndex === presentImgObject.images.length-2) // if user has not gone off leftwards to look at the already loaded images while the next one is being fetched: it will set the new images to be displayed.
			{
				presentImageIndex = presentImgObject.images.length-1;
				displayImageFullWindow(true);
			}
		}
	}
	else if (presentImageIndex === presentImgObject.images.length-1 && presentImgObject.downloadedAllOccurrences) fullWindowNavigationStates('atEndNoMoreDownloads');
	else if (presentImageIndex < presentImgObject.images.length-1)
	{
		presentImageIndex++;
		displayImageFullWindow(true);
	}
}

function goLeft()
{
	if (presentImageIndex < 1) fullWindowNavigationStates('atBeginning');
	else
	{
		presentImageIndex--;
		displayImageFullWindow(true);
	}
}

function displayImageFullWindow(rerender, shiftIndex, theIndex, GBIFResult)
{
	if (theIndex !== undefined) presentImageIndex = theIndex;
	if (shiftIndex !== undefined) presentImageIndex += shiftIndex;
	if (GBIFResult !== undefined)
	{
		presentObject = GBIFResult;
		presentImgObject = GBIFResult.imagesObject; // for convenience :)
	}
	
	if (fullWindow.style.display !== 'block') goFullWindow();
	fullWindowImage.src = presentImgObject.images[presentImageIndex];
	fullWindowImage.onload = () =>
	{
		if (rerender) fullWindowImage.style.opacity = 1/3;
		imagePlacement();
		if (rerender) fullWindowImage.animate(imageFadeIn, fadeTime).onfinish = ()=> fullWindowImage.style.opacity = 1;
		
		if (presentImageIndex === 0 && presentImgObject.occurrencesCount + presentImgObject.mediaCount > 1) fullWindowNavigationStates('atBeginning'); // the second if-check is necessary in case there's only one occurrence image in total.
		else if (presentImageIndex === 0 && presentImgObject.occurrencesCount + presentImgObject.mediaCount === 1 && presentImgObject.downloadedAllOccurrences) fullWindowNavigationStates('onlyOneImage');
		else if (presentImgObject.downloadedAllOccurrences && presentImageIndex >= presentImgObject.images.length-1) fullWindowNavigationStates('atEndNoMoreDownloads');
		else fullWindowNavigationStates();
	};
}

function imagePlacement()
{
	const windowAspectRatio = fullWindow.clientWidth / fullWindow.clientHeight;
	const imageAspectRatio = fullWindowImage.naturalWidth / fullWindowImage.naturalHeight;
	
	//console.log("Image Resolution: "+fullWindowImage.naturalWidth+" * "+fullWindowImage.naturalHeight);
	//console.log("Image Aspect Ratio: "+imageAspectRatio);
	//console.log("Window Resolution: "+fullWindow.clientWidth+" * "+fullWindow.clientHeight);
	//console.log("Window Aspect Ratio: "+windowAspectRatio);
	
	if (fullWindowImage.naturalWidth < fullWindow.clientWidth && fullWindowImage.naturalHeight < fullWindow.clientHeight)
	{
		fullWindowImage.style.width = fullWindowImage.naturalWidth+'px';
		fullWindowImage.style.height = fullWindowImage.naturalHeight+'px';
	}
	else if (imageAspectRatio >= windowAspectRatio)
	{
		fullWindowImage.style.width = '100%';
		fullWindowImage.style.height = fullWindow.clientWidth/imageAspectRatio+'px';
		console.log("RENDERED Image Aspect Ratio: "+fullWindow.clientWidth/(fullWindow.clientWidth/imageAspectRatio));
	}
	else
	{
		fullWindowImage.style.height = '100%';
		fullWindowImage.style.width = fullWindow.clientHeight*imageAspectRatio+'px';
		console.log("RENDERED Image Aspect Ratio: "+(fullWindow.clientHeight*imageAspectRatio)/fullWindow.clientHeight);
	}
	// ... fullWindowImage.style['aspect-ratio'] = aspectRatio ...doesn't work really (maybe only with div containers?). That's why I had to come up with my own full-screen logic upper. For displaying full-screen, it all comes down to knowing the aspect ratios of the window and the image.
}

window.addEventListener('resize', ()=>
{
	if (fullWindow.style.display === 'block')
	{
		fullWindowPlacements();
		imagePlacement();
		//if (isMobile) arrowPlacements();
	}
});
/*
function preventDef(e)
{
	if((isMobile || isTablet) && fullWindow.style.display === 'block') e.preventDefault();
}
fullWindow.addEventListener('touchstart', preventDef)
fullWindow.addEventListener('touchmove', preventDef)
*/
export {fullWindow, displayImageFullWindow, goLeft, goRight};