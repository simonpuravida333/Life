const shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
shape.setAttribute("cx", 50); // coordinates of circle center within the svg box.
shape.setAttribute("cy", 50);
shape.setAttribute("r",  40); // for ellipses use rx and ry
shape.setAttribute("fill", "rgba(0,0,0,0)");
// shape.setAttribute("stroke", "deepskyblue");
shape.setAttribute("stroke-width",12);
shape.setAttribute("stroke-linecap","round");
const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
filter.setAttribute("id","filterId");
const dropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
dropShadow.setAttribute('dx',0);
dropShadow.setAttribute('dy',0);
dropShadow.setAttribute('stdDeviation',2);
dropShadow.setAttribute('flood-color', 'deepskyblue');
filter.append(dropShadow);

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.style.width = '100px';
svg.style.height = '100px';
svg.style.position = 'relative';
// svg.setAttribute('viewBox','0 0 100 100'); // we don't need scaling. https://css-tricks.com/scale-svg/
// svg.style.transform = 'translate(-50%,-50%)'; // already placed in center by parent div.
svg.append(shape, filter);
// shape.setAttribute("filter","url(#filterId)"); // uncomment this to have a weak glow.

const svg2 = svg.cloneNode(true);
svg2.style.transform = 'translate(-50%,-50%)';
const shape2 = shape.cloneNode(true);
svg2.append(shape2);

// ANIMATION
// stroke length unit is the CIRCUMFERENCE calculated from the r dimension units, in this case pixels: 2*pi*r
// it would be nicer to have degrees or percentages, since it is a circle. But that's how SVG works.
// so for a circle stroke of three dashes and three gaps of equal lengths the 'stroke-dasharray' value would be (2*pi*r)/6.
// ANIMATION SYNTAX: in the CSS styling it's 'stroke-dasharray', in JS for the animation function (element.animate) it's strokeDasharray, as CSS attributes are usually described in JS. But unlike in general JS where you can write element.style['attribute-name'] it doens't take strings as names like 'stroke-dasharray'. Multiple values are in inverted comma: 'number, number, ...' not in array, like [1,3]. This in contrast to setAttribute for SVGs which does take strings as names and values in array brackets: shape.setAttribute('stroke-dasharray', [number, number])
// TIP: create shapes in Illustrator, Figma or another vector program, save as SVG and open it in a text editor. Edit the file in the vector graphics program to see on the fly how the SVG is constructed in the text editor. You can directly copy it over to your HTML space to see it take effect in the browser.

const circum = Math.PI*2*shape.r.baseVal.value;
const transition = ((circum/4)*0.05).toString()+","+((circum/4)*0.95).toString();
const loadRotate =
[
	{ strokeDasharray: transition },
	{ strokeDasharray: circum/8 },
	{ strokeDasharray: circum/8, strokeDashoffset: circum/4 },
	{ strokeDasharray: transition, strokeDashoffset: circum/4 },
];
const loadTiming =
{
  	duration: 2000,
  	iterations: Infinity,
};
shape.animate(loadRotate, loadTiming);
shape2.animate(loadRotate, loadTiming);

const colorTransitions = ['hsl(25,100%,57.5%)','hsl(50,100%,45%)','hsl(75,100%,45%)','hsl(100,100%,45%)','hsl(125,100%,45%)','hsl(150,100%,45%)','hsl(175,100%,45%)','hsl(200,100%,60%)','hsl(175,100%,45%)','hsl(150,100%,45%)','hsl(125,100%,45%)','hsl(100,100%,45%)','hsl(75,100%,45%)','hsl(50,100%,45%)','hsl(25,100%,57.5%)'];
const loadColorTransition = { stroke: colorTransitions };
// just going from hsl(25... to hsl(100... directly won't make it move through the spectrum. It just jumps from orange to blue, with some grey as a transitional colour, and not a mix of both (green), which I was assuming and hoping for first. Thinking about it, it's probably because orange and blue are complimentary colours, so they cancel each other out, leaving it colourless in the transition. After all it's light that gets added up (additive colour); in case of subtractive colours (like watercolours on paper) it would indeed be green in between.

const loadTiming2 =
{
  	duration: 8000,
  	iterations: Infinity,
};
shape.animate(loadColorTransition, loadTiming2);
shape2.animate(loadColorTransition, loadTiming2);

const contractXToCenter = {transform: ['scaleX(1)', 'scaleX(0.01)']}
const expandXFromCenter = {transform: ['scaleX(0.01)', 'scaleX(1)']}

const contractToLeft =
[
	{ transform: 'scaleX(1)', margin: "0", padding: "0"},
	{ transform: 'scaleX(0.1)', margin: '0%', padding: '0%'}
]
const expandFromLeft =
[
	{ transform: 'scale(0.1)', marginLeft: '0px',marginRight:'0px', paddingLeft: '0px', paddingRight: '0px'},
	{ transform: 'scale(1)', marginLeft: '10px',marginRight:'10px', paddingLeft: '20px', paddingRight: '20px'}
]
const grow ={transform: ['scale(0.1)','scale(1)']}

function fontOpacityZeroToFull(r,g,b,zeroToFull)
{
	let theReturn;
	if (zeroToFull) theReturn = {color: ['rgba('+r+','+g+','+b+',0)', 'rgba('+r+','+g+','+b+',1)']}
	else theReturn = {color: ['rgba('+r+','+g+','+b+',1)', 'rgba('+r+','+g+','+b+',0)']}
	return theReturn;
}

const fadeIn = {opacity: [0,1]}
const fadeOut = {opacity: [1,0]}
const imageFadeIn = {opacity: [1/3, 1]}
const imageFadeOut = {opacity: [1, 1/3]}

const contractLine =
[
	{ width: '100%', left: "0px"},
	{ width: '0px', left: '0px'}
]

function brighten (colorDegree)
{
	return {backgroundColor: ['hsl('+colorDegree+', 70%, 70%)', 'hsl('+colorDegree+', 85%, 85%)', 'hsl('+colorDegree+', 70%, 70%)']} // about first animation-state: it is already at 70% 70% from mouse hovering
}

function brightenHover (colorDegree)
{
	return {backgroundColor: ['hsl('+colorDegree+', 50%, 50%)', 'hsl('+colorDegree+', 70%, 70%)']}
}

function removeAni (initialColor, deleteSignalColor)
{
	return {backgroundColor: [initialColor, initialColor, initialColor, deleteSignalColor]}
}

const fadeTime = 333;

export {svg, svg2, fadeTime, fadeIn, fadeOut, imageFadeIn, imageFadeOut, contractToLeft, expandFromLeft, contractXToCenter, expandXFromCenter, grow, fontOpacityZeroToFull, brighten, brightenHover, removeAni};