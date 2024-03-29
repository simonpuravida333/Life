import touchResponse from './swipe.js'

// this module contains individually created ("scripted" that is) graphics. As they appear only once, and as I was designing and figuiring out on the fly, all the styling is set in JS, just in this module.

const spaceForNature = g();
spaceForNature.classList.add('flexPart');
if (isMobile)
{
	spaceForNature.style['margin-bottom'] = '0px';
	spaceForNature.classList.add('center');
}
else 
{
	spaceForNature.style['margin-bottom'] = '-30px';
	spaceForNature.style['justify-content'] = 'right';
}
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
//leaf.style.border = '10px solid #83FF97';
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
	//const sizeVariation = randomInt(90,110); // the random size works, but it doesn't scale the text, which is appended to the square, not the leaf.
	//const size = sizeVariation+'px';
	const size = '100px';
	//const margin = 100-sizeVariation+'px';
	const variation = randomInt(-10,10);
	leaves[x].style.width = size;
	leaves[x].style.height = size;
	//leaves[x].style.margin = margin;
	leaves[x].style['background-image'] = 'linear-gradient('+(-45-15-variation)+'deg,' + ((x<2) ? ' #3C7F45, #5FCE79, #83FF97)' : '#CC7D36, orange, #FFE299)');
	//leaves[x].style['box-shadow'] = '10px 10px 20px rgba(255,255,255,0.5), 10px -10px 20px rgba(255,255,255,0.5), -10px 10px 20px rgba(255,255,255,0.5), -10px -10px 20px rgba(255,255,255,0.5)';
	if (isMobile)
	{
		squares[x].style.transform = 'rotateZ(45deg)';
		leaves[x].style['background-image'] = 'linear-gradient(-45deg,' + ((x<2) ? ' #3C7F45, #5FCE79, #83FF97)' : '#CC7D36, orange, #FFE299)');
		texts[x].style.opacity = 1;
		spaceForNature.style.zoom = 0.8;
	}
	else
	{
		squares[x].style.transform = 'translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ('+(windDirection+variation)+'deg) skew(-15deg)';
		const squareAni = squares[x].animate({transform: ['translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ('+(windDirection+variation)+'deg) skew(-15deg)', 'translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(45deg) skew(0deg)'], filter: ['brightness(1)', 'brightness(1.2)']},{duration: 500, easing: 'ease-in-out'});
		squareAni.pause();
		const textAni = texts[x].animate({opacity: [0,0,1]},500);
		textAni.pause();
		const leafAni = leaves[x].animate({backgroundImage: ['linear-gradient('+(-45-15-variation)+'deg,' + ((x<2) ? ' #3C7F45, #5FCE79, #83FF97)' : '#CC7D36, orange, #FFE299)'), 'linear-gradient(-45deg,' + ((x<2) ? ' #3C7F45, #5FCE79, #83FF97)' : '#CC7D36, orange, #FFE299)')], boxShadow: ['none','none', 'none', '0 0 20px rgba(255,255,255,0), 0 0 20px rgba(255,255,255,0), 0 0 20px rgba(255,255,255,0), 0 0 20px rgba(255,255,255,0)', '10px 10px 20px rgba(255,255,255,0.3), 10px -10px 20px rgba(255,255,255,0.3), -10px 10px 20px rgba(255,255,255,0.3), -10px -10px 20px rgba(255,255,255,0.3)']},500);
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
			leafAni.onfinish = ()=>
			{
				leaves[x].style['background-image'] = 'linear-gradient(-45deg,' + ((x<2) ? ' #3C7F45, #5FCE79, #83FF97)' : '#CC7D36, orange, #FFE299)');
				leaves[x].style['box-shadow'] = '10px 10px 20px rgba(255,255,255,0.3), 10px -10px 20px rgba(255,255,255,0.3), -10px 10px 20px rgba(255,255,255,0.3), -10px -10px 20px rgba(255,255,255,0.3)';
			}
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
			leafAni.onfinish = ()=>
			{
				leaves[x].style['background-image'] = 'linear-gradient('+(-45-15-variation)+'deg,' + ((x<2) ? ' #3C7F45, #5FCE79, #83FF97)' : '#CC7D36, orange, #FFE299)');
				leaves[x].style['box-shadow'] = 'none';
			}
		}
	}
}

texts[0].innerHTML = 'GO';
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
//blossom.style.border = '3px solid black';
blossom.style.position = 'relative';
blossom.style['margin-left'] = '150px';
blossom.style['margin-right'] = '30px';
blossom.style['margin-bottom'] = '-10px';
blossom.style.cursor = 'pointer';
spaceForNature.append(blossom);
blossom.append(petal);
blossom.append(centerPetal);

for (let x = 0; x < 5; x++)
{
	petals[x].style.transform = 'rotate('+x*72+'deg) translateY(65%)' + ((!isMobile) ? ' skew(-15deg)' : '');
	blossom.append(petals[x]);
	if (!isMobile)
	{
		petalsAnis[x] = petals[x].animate({transform: ['rotate('+x*72+'deg) translateY(65%) skew(-15deg)', 'rotate('+x*72+'deg) translateY(65%) skew(0deg)'], boxShadow: ['none', 'none', 'none', '0px 0px 0px rgba(255,255,255,0.5)', '0px 10px 11px rgba(255,255,255,0.5)']},500)
		petalsAnis[x].pause();
	}

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

if (isMobile)
{
	blossom.style['margin-left'] = '30px';
	blossom.style.transform = 'rotateZ(-36deg)';
	blossomText.style.opacity = 1;
}
else 
{
	blossom.style.transform = 'translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ(75deg) skew(-15deg)';
	const blossomAni = blossom.animate({transform: ['translate3d(20%, 20%, 0) rotateX(36deg) rotateY(-36deg) rotateZ(75deg) skew(-15deg)', 'translate3d(0%, 0%, 0) rotateX(0deg) rotateY(0deg) rotateZ(-36deg) skew(0deg)'], filter: ['brightness(1)','brightness(1.2)']},500);
	blossomAni.pause();
	const blossomTextAni = blossomText.animate({opacity: [0,0,0,1]},500);
	blossomTextAni.pause();
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
			petalsAnis[x].onfinish = ()=>
			{
				petals[x].style.transform = 'rotate('+x*72+'deg) translateY(65%) skew(0deg)';
				petals[x].style['box-shadow'] = '0px 10px 11px rgba(255,255,255,0.5)';
			}
		}
		blossomTextAni.playbackRate = 1;
		blossomTextAni.play();
		blossomTextAni.onfinish = ()=> blossomText.style.opacity = 1;
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
			petalsAnis[x].onfinish = ()=>
			{
				petals[x].style.transform = 'rotate('+x*72+'deg) translateY(65%) skew(-15deg)';
				petals[x].style['box-shadow'] = 'none';
			}
		}
		blossomTextAni.reverse();
		blossomTextAni.onfinish = ()=> blossomText.style.opacity = 0;
	}
}

const chapterTexts =
{
	1: "This app allows you to search the<br><strong style='color: cyan'><i>GLOBAL BIODIVERSITY INFORMATION FACILITY (GBIF).</strong>",
	title1: "<strong>TITLE</strong>",
	2: "The application helps you <strong style='color: cyan'><i>FIND ANY SPECIES OF LIFE</i></strong> by using vernacular names as queries (like <i>'blueberry'</i>). So when querying within a selected rank <i>SPECIES</i>, it will search the GBIF for <i>specieses</i> which are associated with this <i>English vernacular name</i>.<br>If you want to search for <i>canonical names</i>, set the selection option to <i>CANONICAL NAME.</i>",
	title2: "<strong>INTRODUCTION</strong>",
	3: "Activate the trigger right of the rank selector (query areas turn orange) to <strong><i>query for taxa of a certain rank within a higher taxon.</i></strong> Note that this only works with canonical names, as the GBIF needs to know the exact taxon within which it can search.<br>For example querying for 'Paradisaeidae' (FAMILY of birds of paradise) and having chosen the rank '<i><strong style='color: cyan'>EVERY SPECIES WITHIN</strong></i>' will yield <i><strong>all</strong></i> SPECIES within the FAMILY rank 'Paradisaeidae'.<br>This would not work when doing a vernacular name search (<i>SPECIES</i> selected) which would yield a smaller amount of birds of paradise; simply each one where the name contains the query <i>'bird of paradise'</i>, and there would be plants as well among the results.",
	title3: "<strong>EVERY SPECIES WITHIN</strong>",
	4: "The <i><strong style='color: cyan'>RESULT SUMMERY AREA</i></strong> appears beneath the search field when results come in. New queries won't reset the content, they'll be added, and you can click on a summery to make the window teleport to the group of results. Holding mouse on a result summery until it turns orange will delete it.",
	title4: "<strong>RESULT SUMMERY</strong>",
	5: "The <i><strong style='color: cyan'>FILTER AREA</i></strong> is for narrowing down results. E.g. querying for the SPECIES 'strawberry' will yield 87 results, 39 of which are animals (surprised? They're strawberry-coloured, -patterned or -shaped insects, anemoa, cockles, sea squirts, fish, frogs, crabs...). Just setting the KINGDOM filter to 'Plantae', you can halve the results. This does not remove the animal results, it just hides them. Setting KINGDOM to '...' will let everything show up again, because '...' (idle filter) will set any lower rank filter to '...' as well. Next to how many results there are for any taxon, filters also show (when opening) which of the taxa are contained within the taxon selected in an upper rank filter: contained taxa are <strong style='color:orange'>bold orange</strong>. This is very useful to get a connected understanding of your results.<br>Filters always keep every taxa from every result, even if the result is not displayed right now from a set filter. This allows you to directly change the setting of the filter. Setting any filter will always pre-fill the higher filters with the ancestor lineage, and the lower filters with '...' to allow everything from this rank onwards (downwards) to be displayed.",
	title5: "<strong>FILTER</strong>",
	6: "The actual, accessable results are always <i><strong style='color: cyan'>GROUPED BY A TITLE</i></strong>, which is your query. Clicking on the title will hide or show the entire group / query results. This may be of use when making multiple queries (having multiple groups). Groups and the upper mentioned <i>result summeries</i> are the same; delete groups by hold mouse or touch on the block in the result summery area.",
	title6: "<strong>RESULT GROUPS</strong>",
	7: "<i><strong style='color: orange'>A NOTE ON EXTINCT SPECIES:</strong></i> Extinct species do not appear among the results. Doing 'every SPECIES within' 'Cetacea' (whales) query will yield 94 species of extant whale species. If extinct species were not filtered out, the results would be more than 7 times as many. Thus far on the GBIF, exctinct species usually don't deliver more material than the canonical name, and so the decision was made to limit it to extant specieses.<br>In this app extinct specieses will still appear among children results when you search search through the taxonomy navigator. It was not possible to filter children directly, but then again, it does make sense for simply every child to appear within a parent taxon, even if extinct.",
	title7: "<strong>A NOTE ON EXTINCT SPECIES</strong>",
	8: "<i><strong style='color: orange'>A NOTE ON USING VERNACULAR NAMES FOR QUERIES:</strong></i> Sometimes the nature of vernacular or folk names can be confusing.<br>E.g. searching for SPECIES 'whale' will yield 58 species of whale where 'whale' is part of the name, like southern right whale, bowhead whale and whaleshark, even though the latter is a shark. But if you searched for SPECIES 'dolphin' you'll be given 48 species that would not appear within the results for 'whale'. Scientifically, dolphins are whales, but in their own FAMILY rank, beneath the ORDER rank Cetacea (whales); for the same reason killer whales would be missing in the 'dolphin' results, even though Orcas belong to the FAMILY of dolphins. Likewise, searching for 'whale' in the FAMILY rank would yield ten families of whales where the dolphin family would be missing as well.",
	title8: "<strong>A NOTE ON USING VERNACULAR NAMES FOR QUERIES</strong>",
	9: "<i><strong style='color: orange'>A NOTE ON OCCURRENCES:</strong></i> Occurrences are sightings of species that get fed to the GBIF from all around the world, to create a picture about the numbers, distribution and conservation status. Many come from biologists, zoologist and conservationists, but citizen scientist may also play their part. Occurrences can be sighting descriptions only without media; some are audio files, but most are images, which are the only ones this app downloads. <i><strong style='color: orange'>IN THIS APP OCCURRENCES APPEAR AS IMAGES</strong></i> and the data is shown when hovering over an image. Since the purpose of GBIF occurrences images is data collection solely, images includes scans of recordings from centuries ago and photos of preserved specimens from museums, though rarer.<br>Most however are sightings in nature, which include dead animals. Thus <i><strong style='color: orange'>PLEASE BE ADVISED</strong></i>, that there can be photos of animals which may be disturbing for some. When querying for 'whale', among the results will be photos of dead beached whales where you can see cut patterns on the back from a ship's rotor blades, or beached whales that have no skin anymore, after days of laying in the sun, scathed by the sand and picked by birds. Some have an opened body or are in a state of progressed decomposition, and may only be identifiable by an expert. Others may be dissected onsite for scientific reasons. Most images however are of live species and provide a colorful, visual viewer experience.",
	title9: "<strong>A NOTE ON OCCURRENCES</strong>",
	10: "Sometimes there just isn't the correct rank; the GBIF decided on the seven most canon / most backbone ranks; but it really just is an approximation to a much more complex tree of life.<br>In truth there many more ranks: E.g. while the GBIF simply has ORDER, in biology there're also (wikipedia) (from top downwards): Magnorder (magnus, 'large, great, important'), Superorder (super, 'above'), Grandorder (grand, 'large'), Mirorder	(mirus, 'wonderful, strange'), then actual ORDER, Suborder (sub, 'under'), Infraorder	(infra, 'below'), Parvorder	(parvus, 'small, unimportant'). An example would be Cetacea (whales): on the GBIF they appear as an ORDER, but are actually an Infraorder. Some in-between ranks like toothed whales (Odontoceti) simply don't exist on the GBIF, even though it's a vast Parvorder that contains all the whales that have teeth, like Dolphins; and the FAMILY of dolphins (Delphinidae) has a Superfamily Delphinoidea and a Subfamily Delphininae...<br>So while infraorder 'Whales' are moved to ORDER, sometimes taxonomy ranks are so off the 7 basic ranks the GBIF provides, that classifications simply aren't present on the GBIF, like toothed whales.<br>In other cases of more simple forms of life, like in certain fungi, nature just doesn't provide enough to have six branches of categorizations. So between species and kingdom, there may just be one or two other ranks.",
	title10: "<strong>A NOTE ON MISSING RANKS</strong>",
	11: "The GBIF also stores every known synonym, which are former canonical names or names that were established for some time in some place but are not part of today's canon. They are important to keep track of, as one may still come upon them in older scientific literature. On the GBIF, each synonym is treated as a full taxon object just like the accepted canonical name, complete with key IDs, ancestry linage and all the standard object data. In this app however with a focus on education and entertainment, synonyms are also being filtered out. Meaning you cannot search for them, but they may appear as part of the data when clicking on a taxon.",
	title11: "<strong>A NOTE ON SYNONYMS<strong>",
}

const howToSpace = g();
howToSpace.classList.add('blockRow');
howToSpace.style.display = 'relative';
howToSpace.style['font-family'] = 'Gaegu';
howToSpace.style['font-size'] = '27px';
howToSpace.style['line-height'] = '30px';
howToSpace.style['border-left'] = '30px solid cyan';
howToSpace.style['padding-left'] = 0;
howToSpace.style['background-color'] = '#325D77';
howToSpace.style.color = 'white';
howToSpace.style.display = 'none';

//for (let x = 1; x <= Object.keys(chapterTexts).length/2; x++)
let chaptersAmount = 0;
for (const key in chapterTexts) if (!isNaN(key)) chaptersAmount = key;
for (let x = 1; x <= chaptersAmount; x++)
{
	const chapterSpace = g();
	chapterSpace.classList.add('flexPart');
	chapterSpace.style['margin-bottom'] = '20px';
	chapterSpace.style['align-items'] = 'start';
	
	const chapterLeaf = g();
	chapterLeaf.style['margin-top'] = '20px';
	chapterLeaf.style.position = 'relative';
	chapterLeaf.style.width = '50px';
	chapterLeaf.style.height = '50px';
	chapterLeaf.style['border-radius'] = '0% 60% 30% 60%';
	chapterLeaf.style['background-color'] = (chapterTexts['title'+x].indexOf('NOTE') === -1) ? 'cyan' : 'orange';
	chapterLeaf.style['margin-right'] = '20px';
	chapterLeaf.style.transform = 'rotate(112.5deg)';
	chapterLeaf.style.cursor = 'pointer';
	chapterLeaf.onmouseover = ()=> chapterLeafGlow(true);
	chapterLeaf.onmouseout = ()=> chapterLeafGlow(false);
	
	const chapterText = g();
	chapterText.style.width = '750px';
	chapterText.style['margin-left'] = '20px';
	chapterText.style['margin-top'] = '20px';
	chapterText.innerHTML = chapterTexts['title'+x]
	//chapterText.onmouseover = ()=> chapterLeafGlow(true);
	//chapterText.onmouseout = ()=> chapterLeafGlow(false);
	
	const chapterLeafAni = chapterLeaf.animate({boxShadow: ['none', '10px 0px 10px rgba(255,255,255,0.5), -10px 0px 10px rgba(255,255,255,0.5), 0px -10px 10px rgba(255,255,255,0.5)']},333);
	chapterLeafAni.pause();
	function chapterLeafGlow(over)
	{
		if (over)
		{
			chapterLeafAni.playbackRate = 1;
			chapterLeafAni.play();
			chapterLeaf.style['box-shadow'] = '10px 0px 10px rgba(255,255,255,0.5), -10px 0px 10px rgba(255,255,255,0.5), 0px -10px 10px rgba(255,255,255,0.5)';
		}
		else
		{
			chapterLeafAni.reverse();
			chapterLeaf.style['box-shadow'] = 'none';
		}
	}
	
	let title = true;
	chapterLeaf.onclick = ()=> 
	{
		if (title)
		{
			chapterText.innerHTML = chapterTexts[x];
			title = false;
			chapterText.onclick = null;
			chapterText.style.cursor = null;
			chapterText.animate({opacity: [0,1]},333);
		}
		else
		{
			title = true;
			chapterText.onclick = ()=> chapterLeaf.click();
			chapterText.style.cursor = 'pointer';
			chapterText.animate({opacity: [1,0]},333).onfinish = ()=> chapterText.innerHTML = chapterTexts['title'+x];
		}
	}
	if (x === 1) chapterLeaf.click();
	else
	{
		chapterText.onclick = ()=> chapterLeaf.click();
		chapterText.style.cursor = 'pointer';
	}
	
	chapterSpace.append(chapterLeaf, chapterText);
	howToSpace.append(chapterSpace);
}

blossom.onclick = ()=>
{
	if (howToSpace.style.display === 'none')
	{
		howToSpace.animate({opacity: [0,1]},500);
		howToSpace.style.display = 'block';
		if (isMobile) touchResponse(howToSpace);
	}
	else howToSpace.animate({opacity: [1,0]},333).onfinish = ()=> howToSpace.style.display = 'none';
}

if (!isMobile)
{
	const close = g();
	close.innerHTML = '⊙';
	close.style.color = 'cyan';
	close.classList.add('closeNewSpeciesSpace');
	close.style.float = 'right';
	close.onmouseover = ()=> close.innerHTML = '⦿';
	close.onmouseout = ()=> close.innerHTML = '⊙';
	close.onclick = ()=> blossom.click();
	howToSpace.prepend(close);
}

export {spaceForNature, parentSquares, blossom, howToSpace};