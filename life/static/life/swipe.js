const body = document.querySelector('body');

export default function touchResponse(element, closeElement)
{
	if (element === null)
	{
		body.ontouchstart = null;
		body.ontouchend = null;
		body.ontouchcancel = null;
		body.ontouchmove = null;
		return;
	}
	else
	{
		body.ontouchstart = (event)=>{handleStart(event)};
	 	body.ontouchend = ()=>{handleEnd(element, closeElement)};
	 	body.ontouchcancel = ()=>{handleCancel(element)};
	 	body.ontouchmove = (event)=>{handleMove(event, element)};
	}
}

let startPosition = 0;
let fullPull = false;
let moment = 0;
const pullLimit = 300;
let locked = false;

function handleStart(event)
{
	startPosition = event.changedTouches[0].clientX;
}

function handleEnd(element, closeElement)
{
	if (fullPull && !locked)
	{
		element.style.display = 'none';
		if (closeElement !== undefined) closeElement(element);
		touchResponse(null);
	}
	element.style.left = null;
	element.style.opacity = 1;
	fullPull = false;
}

function handleCancel(element)
{
	element.style.left = null;
	element.style.opacity = 1;
	fullPull = false;
}

function lockUnlock()
{
	if (moment+500 > new Date().getTime()) locked = true;
	else locked = false;
}

function handleMove(event, element)
{	
	if (event.touches.length > 1)
	{
		moment = new Date().getTime();
		lockUnlock();
		return; // only one finger allowed, or it would mess when the user tried to zoom (pinch / two finger interaction)
	}
	lockUnlock();
	let delta = event.changedTouches[0].clientX - startPosition;
	if (delta > 0) return;
	element.style.left = delta+'px';
	delta = delta*-1;
	element.style.opacity = (pullLimit-delta)/pullLimit;
	if (delta > pullLimit)
	{
		delta = pullLimit;
		fullPull = true;
	}
}