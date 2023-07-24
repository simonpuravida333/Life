//TODO: WHEN NOT IN FULLWINDOW AND FLIPPING SCREEN, THEN FULLWINDOW DOESN'T KNOW THAT A RESIZE HAS HAPPENED.

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