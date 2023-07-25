// This module is not in use anymore. 
// Originally this module was supposed to give interactive features to the fullWindow mode (full-screen images) on smartphone and tablets, with one functionality being that you can pull arrows towards the center to load navigate to the next / previous image (like canva presentation on mobiles). But the fullWindow mode itself proved tricky for mobiles. It had especially to do with the different zoom level and the fact that you could tilt the screen, where it didn't get the position of the fullWindow perfectly right (on a potentially 30k or more pixel high document) I tried implementations and a lot of testing, and it mostly worked, but in the end I just realized that the safest and most sensible would be to add a big screen presentation to the GBIFResult at the bottom, which solved everything. In the GBIFResult object it's called mobileFullWidthImage. If the user has the smartphone upright and it loads a widescreen image, they can just tilt the phone and there it perfectly is, filling the screen, at the lower end of the GBIFResult space.
// Along the way I also ditched the Bootstrap mobile adjustment and did everything by hand, which wasn't much really. I just needed to apply a zoom on the body (different for smartphone tilts) and make some style adjustments in the mobile.css file, which is a copy of styles.css with small screen adjustment.
// It was only after I abandoned (after a long fight) the fullWindow mode for mobiles, that I realized that window.srollTo didn't have a zoom multiplier. That might have solved it. If you have a zoom of 1.5, you need to add that as a multiplier to window.scrollTo and window.scrollByY. Nontheless, I like this solution much more, it's much more mobile friendly and lovely in look. The fullWindow mode is really more fitting for desktops. I'm still grateful for this exploration as it taught me a lot about the touch gestures. For e.g. the arrow-pull navigation (like in Canva) worked perfectly fine. And it was intuitive too, I just needed to learn about the (fairly low-level) touch gestures on MDN a bit and could then quickly implement a gesture completely by my own reasoning.

const body = document.querySelector('body');

export default function touchResponse(elements, goLeft, goRight)
{
 	body.addEventListener("touchstart",(event)=>{handleStart(event, elements)});
 	body.addEventListener("touchend",(event)=>{handleEnd(event, elements, goLeft, goRight)});
 	body.addEventListener("touchcancel",(event)=>{handleCancel(event, elements, goLeft, goRight)});
 	body.addEventListener("touchmove",(event)=>{handleMove(event, elements)});
}

let movements = 0;
let startPosition = 0;
let startPositions = [];
let fullPull = 0;

function handleStart(event, elements)
{
	event.preventDefault();
  	//alert("touchstart.");
	startPosition = event.changedTouches[0].clientX;
	console.log("start position: "+ startPosition);
	
	// elements
	for (const element of elements) startPositions.push(Number(element.style.left.replace('px','')))
	console.log(startPositions)
}

function handleEnd(event, elements, goLeft, goRight)
{
	console.log('ENDED')
	movements = 0;
	startPosition = 0;
	
	// new
	for (let x = 0; x<elements.length; x++) elements[x].style.left = startPositions[x]+'px';
	startPositions = [];
	if (fullPull > 0) goRight();
	else if (fullPull < 0) goLeft();
	fullPull = 0;
}

/*
const bluCirc = document.createElement('div');
bluCirc.style.position = 'absolute';
bluCirc.style.left = '500px';
bluCirc.style.top = '500px';
bluCirc.style.width = '200px';
bluCirc.style.height = '200px';
bluCirc.style['border-radius'] = '100px';
bluCirc.style['background-color'] = 'rgb(50,50,50)';
bluCirc.style.color = 'black';
bluCirc.style['font-weight'] = 'bold';
bluCirc.style.padding = '150px';
body.append(bluCirc);
*/

function handleMove(event, elements)
{
	movements = event.changedTouches[0].clientX;
	console.log(startPosition)
	let delta = movements - startPosition;
	// bluCirc.style['background-color'] = 'rgb(50,'+delta+','+delta+')'; // TEST OBJECT
	// bluCirc.innerHTML = window.innerHeight;
	if (delta > 200)
	{
		delta = 200;
		fullPull = -1;
	}
	else if (delta < -200)
	{
		delta = -200;
		fullPull = 1;
	}
	if (delta < 0)
	{
		elements[1].style.left = startPositions[1]+delta+'px';
		delta *= -1;
		//elements[1].style.transform = 'scale('+delta/100+')';
		elements[1].style.color = 'rgb(50,'+delta+','+delta+50+')';
	}
	else
	{
		elements[0].style.left = startPositions[0]+delta+'px';
		//elements[0].style.transform = 'scale('+delta/100+')';
		elements[0].style.color = 'rgb(50,'+delta+','+delta+50+')';
	}
}

function handleCancel(event, elements, goLeft, goRight)
{
	console.log('CANCELED');
	movements = 0;
	startPosition = 0;
	
	// new
	for (let x = 0; x<elements.length; x++) elements[x].style.left = startPositions[x]+'px';
	startPositions = [];
	if (fullPull > 0) goRight();
	else if (fullPull < 0) goLeft();
	fullPull = 0;
}