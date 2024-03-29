function capitalizeFirstLetters(str)
{
	const strArray = str.toLowerCase().split(' ');
	let theReturn = '';
	for (let part of strArray) theReturn += ' '+part.charAt(0).toUpperCase()+part.substr(1);
	return theReturn.substr(1); //dismiss first white space
}

function getRndInteger(min, max)
{
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getRndFloat(min, max)
{
	return Math.random() * (max - min) + min;
}

// GLOBAL ELEMENT GENERATOR
function generate(elementType)
{
	if (elementType === undefined) return document.createElement('div');
	else elementType = elementType.toLowerCase();
	const elements = ['img','input','textarea','button','select','option','a'];
	for (const e of elements) if (e.startsWith(elementType)) return document.createElement(e);
}

//... just using globalThis.variable = value will leave the global variables mutable. Thus I use this defineProperty function to set writable: false. ... it's strange that by default exported variables are immutable while global variables are mutable. It should be the opposite for both cases.

Object.defineProperty(globalThis, 'caps', {
  value: capitalizeFirstLetters,
  writable: false,
});

Object.defineProperty(globalThis, 'randomInt', {
  value: getRndInteger,
  writable: false,
});

Object.defineProperty(globalThis, 'randomFloat', {
  value: getRndFloat,
  writable: false,
});

Object.defineProperty(globalThis, 'g', {
  value: generate,
  writable: false,
});

// GLOBAL TAXA NAMES
Object.defineProperty(globalThis, 'taxaKeys', {
  value: ["kingdom", "phylum", "class", "order", "family", "genus", "species"],
  writable: false,
});

// GLOBAL TAXA RANK INDECES
Object.defineProperty(globalThis, 'ranks', {
  value: [0,1,2,3,4,5,6], // allows me to use for-of loops in JS as if it were for-ins in Python. Meaning: I don't have to describe for (intialize; condition; afterthought) every time I loop through taxaKeys or taxaBlocks (create.js) and need the indeces.
  writable: false,
});

// GLOBAL MOBILE BOOLEAN (used to adapt certain code to mobile)
const userAgent = navigator.userAgent.toLowerCase();
const mobileBool = /iPhone|Android/i.test(navigator.userAgent);
const tabletBool = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent); // credits: eyehunts.com > https://tutorial.eyehunts.com/js/javascript-detect-mobile-or-tablet-html-example-code/
const touchBool = mobileBool || tabletBool;
if (mobileBool && tabletBool) isMobile = false; // assuming it's an Android tablet

Object.defineProperty(globalThis, 'isMobile', {
  value: mobileBool,
  writable: false,
});

Object.defineProperty(globalThis, 'touch', {
  value: touchBool,
  writable: false,
});