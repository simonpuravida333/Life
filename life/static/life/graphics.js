const spaceForNature = g();
spaceForNature.classList.add('flexPart');
// spaceForNature.style.border = '2px solid black';
spaceForNature.style['margin-bottom'] = '-30px';
spaceForNature.style['margin-top'] = '20px';
spaceForNature.style.position = 'relative';
spaceForNature.style['z-index'] = 1;
spaceForNature.style['justify-content'] = 'right';
//spaceForNature.style.transform = 'rotate(180deg)';

const parentSquare = g(); // static flat surface to trigger hover action
parentSquare.style.position = 'relative';
parentSquare.style.width = '100px';
parentSquare.style.height = '100px';
parentSquare.style['border-radius'] = '50%';
//parentSquare.style.border = '2px solid black';
parentSquare.style.cursor = 'pointer';
parentSquare.style.margin = '5px';
parentSquare.style['margin-left'] = '-5px';

const square = g(); // to get transformed and animated, contains graphics and font
square.style.width = '100px';
square.style.height = '100px';
square.style.position = 'absolute';
square.style['pointer-events'] = 'none';

const leaf = g();
leaf.style.position = 'absolute';
leaf.style.bottom = '0px';
leaf.style['border-radius'] = '0% 60% 30% 60%';
//leaf.style.border = '10px solid #B3FFC5';
//leaf.style['border-top'] = '0px';
//leaf.style['border-left'] = '0px';

const text = g();
text.style.position = 'absolute';
text.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
text.style.top = '50%';
text.style.left = '50%';
text.style['font-family'] = 'Gaegu';
text.style.color = 'white';
text.style['font-size'] = '25px';
text.style['text-align'] = 'center';
text.style.opacity = 0;

const parentSquares = [parentSquare, parentSquare.cloneNode(), parentSquare.cloneNode(), parentSquare.cloneNode()]
const squares = [square, square.cloneNode(), square.cloneNode(), square.cloneNode()];
const leaves = [leaf, leaf.cloneNode(), leaf.cloneNode(), leaf.cloneNode()];
const texts = [text, text.cloneNode(), text.cloneNode(), text.cloneNode()];

const windDirection = 75;
for (let x = 0; x < squares.length; x++)
{
	squares[x].append(leaves[x])
	squares[x].append(texts[x]);
	parentSquares[x].append(squares[x])
	spaceForNature.append(parentSquares[x]);
	//const size = randomInt(90,110)+'px';
	const size = '100px';
	const variation = randomInt(-10,10);
	leaves[x].style.width = size;
	leaves[x].style.height = size;
	leaves[x].style['background-image'] = 'linear-gradient('+(-45-15-variation)+'deg,' + (x<2) ? ' #438E55, #229A48, #B3FFC5)' : '#CC7D36, orange, #FFE299)';
	squares[x].style.transform = 'translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ('+(windDirection+variation)+'deg) skew(-15deg)';
	const squareAni = squares[x].animate({transform: ['translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ('+(windDirection+variation)+'deg) skew(-15deg)', 'translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(45deg) skew(0deg)'], filter: ['brightness(1)', 'brightness(1.2)']},{duration: 500, easing: 'ease-in-out'});
	squareAni.pause();
	const textAni = texts[x].animate({opacity: [0,0,1]},500);
	textAni.pause();
	const leafAni = leaves[x].animate({backgroundImage: ['linear-gradient('+(-45-15-variation)+'deg,' + ((x<2) ? ' #438E55, #229A48, #B3FFC5)' : '#CC7D36, orange, #FFE299)'), 'linear-gradient(-45deg,' + ((x<2) ? ' #438E55, #229A48, #B3FFC5)' : '#CC7D36, orange, #FFE299)')]},500);
	leafAni.pause();
	parentSquares[x].onmouseover = ()=>
	{
		squareAni.playbackRate = 1;
		squareAni.play();
		squareAni.onfinish = ()=>
		{
			squares[x].style.filter = 'brightness(1.2)';
			squares[x].style.transform = 'translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(45deg) skew(0deg)';
		}
		textAni.playbackRate = 1;
		textAni.play();
		textAni.onfinish = ()=> texts[x].style.opacity = 1;
		leafAni.playbackRate = 1;
		leafAni.play();
		leafAni.onfinish = ()=> leaves[x].style['background-image'] = 'linear-gradient(-45deg,' + ((x<2) ? ' #438E55, #229A48, #B3FFC5)' : '#CC7D36, orange, #FFE299)');
	}
	parentSquares[x].onmouseout = ()=>
	{
		squareAni.reverse();
		squareAni.onfinish = ()=>
		{
			squares[x].style.filter = null;
			squares[x].style.transform = 'translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ('+(windDirection+variation)+'deg) skew(-15deg)';
		}
		textAni.reverse();
		textAni.onfinish = ()=> texts[x].style.opacity = 0;
		leafAni.reverse();
		leafAni.onfinish = ()=> leaves[x].style['background-image'] = 'linear-gradient('+(-45-15-variation)+'deg,' + ((x<2) ? ' #438E55, #229A48, #B3FFC5)' : '#CC7D36, orange, #FFE299)');
	}
}

texts[0].innerHTML = 'GO'
texts[0].style['font-size'] = '55px';
texts[1].innerHTML = 'LO\nCATE';
texts[1].style['line-height'] = '25px';
texts[1].style['font-size'] = '35px';
const word1 = g();
const word2 = g();
word1.innerHTML = 'NEW';
word2.innerHTML = 'SPECIES';
word2.style['margin-top'] = '-20px'
word1.style['font-size'] = '40px';
word2.style['font-size'] = '20px';
texts[2].append(word1, word2);
const word3 = g();
word3.innerHTML = 'OCCUR\nRENCE';
word3.style['font-size'] = '20px';
word3.style['line-height'] = '20px';
word3.style['margin-top'] = '-15px';
texts[3].append(word1.cloneNode(true), word3);

const petal = g();
petal.style.width = '35px';
petal.style.height = '50px';
petal.style['border-radius'] = '100%';
petal.style['background-image'] = 'linear-gradient(0deg, #FFDEEF, #FFA9D6, #F94BA7)';
petal.style.position = 'absolute';
petal.style.left = '25%';
petal.style.top = '25%';
petal.style['pointer-events'] = 'none';
const centerPetal = petal.cloneNode();
centerPetal.style.width = '40px';
centerPetal.style.height = '40px';
centerPetal.style['background-image'] = null;
centerPetal.style['background-color'] = '#F94BA7';

const petalsAnis = Array(5);
const petals = [petal, petal.cloneNode(), petal.cloneNode(), petal.cloneNode(), petal.cloneNode()];

const blossom = g();
blossom.style.width = '100px';
blossom.style.height = '100px';
blossom.style['border-radius'] = '50%';
// blossom.style.border = '3px solid black';
blossom.style.position = 'relative';
blossom.style['margin-left'] = '60px';
blossom.style['margin-right'] = '30px';
blossom.style['margin-bottom'] = '-10px';
blossom.style.cursor = 'pointer';
spaceForNature.append(blossom);
blossom.append(petal);
blossom.append(centerPetal);

for (let x = 0; x < 5; x++)
{
	petals[x].style.transform = 'rotate('+x*72+'deg) translateY(65%) skew(-15deg)';
	blossom.append(petals[x]);
	petalsAnis[x] = petals[x].animate({transform: ['rotate('+x*72+'deg) translateY(65%) skew(-15deg)', 'rotate('+x*72+'deg) translateY(65%) skew(0deg)']},500)
	petalsAnis[x].pause();
}

const blossomText = g();
blossomText.innerHTML = 'HOW\nTO';
blossomText.style['font-family'] = 'Gaegu';
blossomText.style.color = 'white';
blossomText.style['font-size'] = '30px';
blossomText.style['line-height'] = '20px';
blossomText.style['text-align'] = 'center';
blossomText.style.position = 'absolute';
blossomText.style.transform = 'translate(-30%, 55%) rotate(36deg)';
blossomText.style.left = '25%';
blossomText.style.top = '10%';
blossomText.style.opacity = 0;
blossomText.style['pointer-events'] = 'none';
blossom.append(blossomText);

blossom.style.transform = 'translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ(75deg) skew(-15deg)';
const blossomAni = blossom.animate({transform: ['translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ(75deg) skew(-15deg)', 'translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(-36deg) skew(0deg)'], filter: ['brightness(1)','brightness(1.2)']},500);
blossomAni.pause();
blossom.onmouseover = ()=>
{
	blossomAni.playbackRate = 1;
	blossomAni.play();
	blossomAni.onfinish = ()=>
	{
		blossom.style.filter = 'brightness(1.2)';
		blossom.style.transform = 'translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(-36deg) skew(0deg)';
	}
	for (let x = 0; x < 5; x++)
	{
		petalsAnis[x].playbackRate = 1;
		petalsAnis[x].play();
		petalsAnis[x].onfinish = ()=> petals[x].style.transform = 'rotate('+x*72+'deg) translateY(65%) skew(0deg)';
	}
	blossomText.animate({opacity: [0,0,0,1]},500).onfinish = ()=> blossomText.style.opacity = 1;
}
blossom.onmouseout = ()=>
{
	blossomAni.reverse();
	blossom.style.filter = 'brightness(1)';
	blossomAni.onfinish = ()=>
	{
		blossom.style.filter = 'brightness(1)'
		blossom.style.transform = 'translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ(75deg) skew(-15deg)';
	}
	for (let x = 0; x < 5; x++)
	{
		petalsAnis[x].reverse();
		petalsAnis[x].onfinish = ()=> petals[x].style.transform = 'rotate('+x*72+'deg) translateY(65%) skew(-15deg)';
	}
	blossomText.animate({opacity: [1,0,0,0]},500).onfinish = ()=> blossomText.style.opacity = 0;
}

export {spaceForNature, parentSquares, blossom};