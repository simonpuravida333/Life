import {svg2, fadeIn, fadeOut, imageFadeIn, imageFadeOut, timing, fadeTime} from './animation.js';

const body = document.querySelector('body');

// AN OVERLAY-BACKGROUND FOR DISPLAYING IMAGES FULL WINDOW
const fullWindow = document.createElement('div');
fullWindow.style['background-color'] = 'rgba(0,25,50,0.8)';
fullWindow.style.position = 'absolute';
fullWindow.style.left = '0px';
fullWindow.style.display = 'none';
fullWindow.addEventListener('wheel', (event)=>
{
	if (event.deltaY > 0) goRight();
	else goLeft();
});
body.appendChild(fullWindow);

// THE FULL-WINDOW IMAGE
const fullWindowImage = document.createElement('IMG');
fullWindow.appendChild(fullWindowImage);

// NAVIGATION INTERACTION
const arrow = document.createElement('div');
arrow.classList.add('fullWindowImageNavigationArrow');
const arrowLeft = arrow.cloneNode();
const arrowRight = arrow.cloneNode();
arrowLeft.style.left = '5%';
arrowRight.style.left = '95%';
arrowLeft.innerHTML = '⪡';
arrowLeft.onmouseover = () => {arrowLeft.style.cursor = 'pointer'; arrowLeft.style.color = 'deepskyblue';}
arrowRight.onmouseout = () =>
{
	arrowRight.style.color = 'white';
	arrowRight.style.cursor = 'default';
};
arrowLeft.onmouseout = () =>
{
	arrowLeft.style.color = 'white';
	arrowLeft.style.cursor = 'default';
};
arrowLeft.addEventListener('click', ()=>{goLeft()});
arrowRight.addEventListener('click', ()=>{goRight()});

svg2.style['z-index'] = 3;
svg2.style.position = 'absolute';
svg2.style.opacity = 0;
/*
const escapeBorder = document.createElement('div');
escapeBorder.id = 'escapeBorder';
escapeBorder.style['z-index'] = 3;*/
const escape = document.createElement('div');
escape.id = 'escape';
escape.innerHTML = '⊙';
escape.style['z-index'] = 3;
/*
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
};*/
escape.onclick = ()=> leaveFullWindow();

fullWindow.appendChild(arrowRight);
fullWindow.appendChild(arrowLeft);
fullWindow.appendChild(svg2);
//fullWindow.appendChild(escapeBorder);
fullWindow.appendChild(escape);

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
	// if body overflow = hidden comes somewhere after fullWindow style = block , fullWindow may end up being placed somewhat vertically off, like 40 or 100px (further down). That happened when clicking on images of multiple GBIF results.
	fullWindow.style.display = 'block';
	fullWindow.animate(fadeIn, fadeTime);
	fullWindow.style.top = window.scrollY+'px'; 
	fullWindow.style.width = '100%'; 
	fullWindow.style.height = '100%';
	
	fullWindow.style['z-index'] = 1; 
	fullWindowImage.style['z-index'] = 2;
	arrowLeft.style['z-index'] = 3; 
	arrowRight.style['z-index'] = 4; 
	
	svg2.style.left = '95%';
	svg2.style.top = '50%';
	svg2.style.top = svg2.getBoundingClientRect().y+svg2.getBoundingClientRect().height/2+4+'px'; // First I use the percentage to the place it, and then relocate it a few pixels. The purpose of this is to move the loading ring a little bit to place it perfectly center on the arrow. Depending on the font you use, the arrow will be located a few pixels elsewhere. The 'height/2' is to counter-act the translate -50%.
	svg2.style.left = svg2.getBoundingClientRect().x+svg2.getBoundingClientRect().width/2-4+'px';
	// console.log("SCROLL HEIGHT: "+window.scrollY);
	//escapeBorder.style.left = '95%';
	//escapeBorder.style.left = escapeBorder.getBoundingClientRect().x+escapeBorder.getBoundingClientRect().width/2-0.5+'px';
}

function leaveFullWindow()
{
	fullWindow.animate(fadeOut, fadeTime/1.5).onfinish = ()=>
	{
		fullWindow.style.display = 'none';
		body.style.overflow = 'auto';
		presentObject.images.style.overflow = 'auto';
	};
}

fullWindowNavigationStates(); // to initialize, to trigger the first four styling attributes
function fullWindowNavigationStates(state)
{
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
		if (!lockedFetchNext) // why is lockedFetchNext === false not part of the parent if condition? Because the interpreter must be prohibited to move over to the else-ifs while lockedFetchNext is true (fetching image) WHILE ALSO presentImageIndex is at right end. So it should just return from this function at the child-if condition not being met. Earlier, while the child if was part of the parent-if, it may have happened that this function is called repeatedly within a fraction of a moment with the last else-if (almost) at the same time is this if-statement, causing a mix-up and allowing presentImageIndex === presentImgObject.images.length; out of bounds in displayImageFullWindow / img.src is undefined. It was an  error difficult to track and probably had to do with the timing of the update of GBIFResult.imagesObject, allowing the last else if-condition to be met sometimes while this one was still in lock. Back then I also used presentImageIndex++ in this if statement instead of just setting it to the end of length, which is safer. So there may have been two concurrent presentImageIndex++s from here and the last else-if. ... It was pretty stable, it would never go beyond index === length, and the user wouldn't even have noticed the error, as the object update (and index update) would soon follow and you could just keep on moving through the images. But the src-undefined error appeared in the log, I wanted to understand it and now it's even more watertight.
		{
			lockedFetchNext = true;
			presentImageIndex = presentImgObject.images.length-1; 
			fullWindowNavigationStates('atEndDownloadMore');
			svg2.animate(fadeIn, timing).onfinish = ()=>{svg2.style.opacity = 1;}
			await presentImgObject.functionAddNextOccurrence();
			svg2.animate(fadeOut, timing).onfinish = ()=>{svg2.style.opacity = 0;}
			lockedFetchNext = false;
			if (presentImageIndex === presentImgObject.images.length-2) // if user has not gone off leftwards to look at the already loaded images while the next one is being fetched.
			{
				presentImageIndex = presentImgObject.images.length-1;
				displayImageFullWindow(true);
			}
		}
	}
	else if (presentImageIndex === presentImgObject.images.length-1 && presentImgObject.downloadedAllOccurrences)
	{
		fullWindowNavigationStates('atEndNoMoreDownloads');
	}
	else if (presentImageIndex < presentImgObject.images.length-1)
	{
		presentImageIndex++;
		fullWindowNavigationStates();
		displayImageFullWindow(true);
	}
}

function goLeft()
{
	if (presentImageIndex < 1) fullWindowNavigationStates('atBeginning');
	else
	{
		presentImageIndex--;
		fullWindowNavigationStates();
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
		presentImgObject = GBIFResult.imagesObject;
	}
	if (fullWindow.style.display === 'none') goFullWindow();
	
	fullWindowImage.src = presentImgObject.images[presentImageIndex].src;

	fullWindowImage.onload = () =>
	{
		if (rerender) fullWindowImage.style.opacity = 1/3;
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
		fullWindowImage.style.position = 'absolute';
		fullWindowImage.style.left = '50%';
		fullWindowImage.style.top = '50%';
		fullWindowImage.style.transform = 'translate(-50%,-50%)';
		if (rerender) fullWindowImage.animate(imageFadeIn, fadeTime).onfinish = ()=> {fullWindowImage.style.opacity = 1};
		
		if (presentImageIndex === 0 && !presentImgObject.downloadedAllOccurrences) fullWindowNavigationStates('atBeginning'); // the second if-check is necessary in case there's only one occurrence image coming from the fetch.js.
		else if (presentImageIndex === 0 && presentImgObject.downloadedAllOccurrences) fullWindowNavigationStates('onlyOneImage');
		else if (presentImgObject.downloadedAllOccurrences && presentImageIndex >= presentImgObject.images.length-1) fullWindowNavigationStates('atEndNoMoreDownloads');
		else fullWindowNavigationStates();
	};
}

export {fullWindow, displayImageFullWindow, goLeft, goRight};