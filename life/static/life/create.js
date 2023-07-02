import {taxaKeys, ranks, resultOverview, filterArea} from './startup.js';
import fetchEverything from './fetch.js';
import {svg, svg2, fadeTime, timing, fadeIn, fadeOut, contractToLeft, expandFromLeft, contractXToCenter, expandXFromCenter, fontOpacityZeroToFull, brighten, brightenHover, removeAni} from './animation.js';
import {constructFilter} from './filter.js';

// + + + CLARIFICATION + + +
// KINGDOM is on top, SPECIES is on the bottom. ... it's all a matter how you look at it. If you think of the "tree of life", then kingdom would be on the bottom / the trunk, with SPECIES being the branches high up. But lets look at kingdom as the over-arching dome under which everything else falls. ...For the case when I comment about 'higher' or 'lower' ranks.
// "GBIF result" is the whole object that appears when querying, it can contain up to seven ranks / up to SPECIES.
// "rank object" is one of the up to seven ranks that a GBIF result can contain, each having its own clickable block in the top section that displays / hides its description part in the middle section

const body = document.querySelector('body');
const allGBIFResults = [];
const allQueriesGroups = []; // this one will also have all the GBIFResults as allGBIFResults does, but collected as groups. I still decided to also keep allGBIFResults, because it makes going through all elements easier. In allQueriesGroups I would always have to use two loops, the outer one going from group to group, the inner going through the GBIFResults. That's a hassle, and so I just keep both arrays. And thankfully so, in the end only one case came up where I have to synchronize them (when removing a group, in createSummery()).

function create(data, querySubmit, rankSubmit)
{
	if (resultOverview.style.opacity < 0.9) resultOverview.animate(fadeIn, fadeTime).onfinish = ()=>{resultOverview.style.opacity = 1;};
	if (filterArea.style.opacity < 0.9) filterArea.animate(fadeIn, fadeTime).onfinish = ()=>{filterArea.style.opacity = 1;}; // why 0.9? becuase maybe the user is so fast and hits enter on a pre-typed text just after having deleted a group. It's highly unlikely though.
	
	let withinRank = false;
	let withinThisRank = '';
	if (rankSubmit.search('within') !== -1)
	{
		querySubmit = querySubmit.slice(0,1).toUpperCase()+querySubmit.slice(1).toLowerCase();
		withinThisRank = rankSubmit.replace('within ','');
		withinRank = true;
	}
	
	//console.log(data);
	
	// CREATE GROUP TITLE SECTION / BEGINNING OF GROUP (OF RESULTS)
	const newGroup = document.createElement('div');
	newGroup.classList.add('flexPart', 'newGroup');
	const line1 = document.createElement('div');
	line1.classList.add('horizontalLine');
	const line2 = line1.cloneNode(true);
	line1.style['margin-right'] = "40px";
	line2.style['margin-left'] = "40px";
	const groupTitle = document.createElement('div');
	if (isNaN(querySubmit)) groupTitle.innerHTML = querySubmit.toUpperCase();
	else groupTitle.innerHTML = data[0].canonicalName+", "+data[0].rank+" (Key: "+data[0].key+")";
	groupTitle.classList.add('groupTitle');
	const circle1 = document.createElement('div');
	circle1.classList.add('circle');
	const circle2 = circle1.cloneNode(true);

	newGroup.append(circle1, line1, groupTitle, line2, circle2);
	const groupResults = document.createElement('div');
	body.append(newGroup, groupResults);
			
	groupTitle.addEventListener('click', () =>
	{
		if (groupResults.style.display !== 'none')
		{
			circle1.animate(fadeOut,fadeTime).onfinish = ()=> {circle1.style.opacity = 0};
			circle2.animate(fadeOut,fadeTime).onfinish = ()=> {circle1.style.opacity = 0};
			line1.animate(contractXToCenter,500).onfinish = ()=> {line1.style.display = 'none'};
			line2.animate(contractXToCenter,500).onfinish = ()=>
			{
				circle1.animate(fadeIn,fadeTime).onfinish = ()=> {circle1.style.opacity = 1};
				circle2.animate(fadeIn,fadeTime).onfinish = ()=> {circle1.style.opacity = 1};
				line2.style.display = 'none';
				groupResults.animate(fadeOut,500).onfinish = ()=> {groupResults.style.display = 'none'};
			};
		} 
		else 
		{
			circle1.animate(fadeOut,fadeTime).onfinish = ()=> {circle1.style.opacity = 0};
			circle2.animate(fadeOut,fadeTime).onfinish = ()=>
			{
				circle2.style.opacity = 0;
				line1.style.display = 'block';
				line2.style.display = 'block';
				line1.animate(expandXFromCenter,500); // using contractXToCenter with reverse() wouldn't perfectly work visually.
				line2.animate(expandXFromCenter,500).onfinish = ()=>
				{
					circle1.animate(fadeIn,fadeTime).onfinish = ()=> {circle1.style.opacity = 1};
					circle2.animate(fadeIn,fadeTime).onfinish = ()=> {circle2.style.opacity = 1};
					groupResults.style.display = 'block';
					groupResults.animate(fadeIn,500);
				}
			}
		}
	});
	const theAni = groupTitle.animate({letterSpacing: ['0.2em','0.35em']},{duration: fadeTime, easing: 'ease-in-out'});
	theAni.pause();
	groupTitle.addEventListener('mouseover', () =>
	{
		if (theAni.playbackRate === -1) theAni.playbackRate = 1; // reverse() function mulitplies playbackRate with -1. So once the mouseout is triggered, it will be reversed here in the second mouseover use. Meaning every second usage of mouse over / out it would be inverted without this check.
		theAni.play();
		theAni.onfinish = ()=> groupTitle.style['letter-spacing'] = '0.35em';
	});
	groupTitle.addEventListener('mouseout', () =>
	{
		theAni.reverse();
		theAni.onfinish = ()=> groupTitle.style['letter-spacing'] = '0.2em';
	});
	// END GROUP TITLE SECTION
	
	// OBJECT THAT SAVES THE GROUP + SOME DATA
	const queryGroup =
	{
		head: newGroup,
		group: groupResults,
		name: querySubmit,
		searchParameter: rankSubmit,
		GBIFResults: [], // the objects
	}
	allQueriesGroups.push(queryGroup); // ...AND ARRAY THAT HOLDS ALL THE GROUP OBJECTS
	
	// ALPHABETICALLY SORT DATA
	const twoDArray = []; // in JS you can't directly insantiate multiple-dimension arrays like "array = [][]", instead you have to construct them like objects, because that's what arrays are in JS.
	for (const eachResult of data) twoDArray.push([eachResult.canonicalName, eachResult]);
	twoDArray.sort(); // will automatically sort the array by reading the first slot of each sub-array.
	data = [];
	for (const eachArr of twoDArray) data.push(eachArr[1]);
	// END SORT
	
	// CAUTION for python-thinkers: in for-in loop x is a stringified number ('2' instead of 2) ...for-in works most of the time, the interpreter always recognizes it as a number when it needs to. At least most of the time: of course it gets iffy if you want sth like array[x+2] as index. Concerning loops with a lot of content like this one, staying with integers ('number' type in js) is probably safest, meaning: classical for or while loop.
	// In the for-of loop, x would become every individual object (e.g. if you have a list of div-elements, x becomes each div-element).
	for (let x = 0; x < data.length; x++)
	{	
		console.log(data[x]);
		// FILTER
		if(data[x].synonym === true) continue;
		if(rankSubmit !== 'any' && rankSubmit !== 'canonicalName' && rankSubmit !== 'highestRank' && rankSubmit !== 'keyID' && rankSubmit.toUpperCase() !== data[x].rank && !withinRank) continue;
		if (withinRank) if (data[x][withinThisRank] !== querySubmit) continue;
		// ENDFILTER
		
		rankSubmit = data[x].rank.toLowerCase(); // to get a rank, onto which create.js relies, when user queried with 'any', 'canonicalName', 'highestRank', or 'keyID'
		// also called 'targetRank' in the GBIFResult object (below), it is the rank the user searched for: the lowest rank (target) is always displayed, also when the GBIF result is closed. If you searched for a FAMILY, the FAMILY taxaBlock is always displayed (upper ranks ORDER, CLASS... are hidden).
		console.log(rankSubmit);
		
		
		
		// THE BASIC AREA FOR EACH RESULT
		const blockRow = document.createElement('div');
		blockRow.classList.add('blockRow');
		//body.append(blockRow);
		groupResults.append(blockRow);
		
		// THE COMPONENTS ON THE BASIC AREA - MADE UP OF THREE PARTS (ROWS)
		
		// the UPPER PART that shows interatable taxaBlocks ranks from KINGDOM up to SPECIES
		const flexPartRanks = document.createElement('div');
		// the MIDDLE PART that displays text information for a rank (clicked on a taxaBlock)
		const line1 = document.createElement('div');
		const flexPartDescription = document.createElement('div');
		const line2 = document.createElement('div');
		// the LOWER PART that shows images
		const flexPartImages = document.createElement('div');
		
		flexPartRanks.classList.add('flexPart');
		flexPartDescription.classList.add('flexPart', 'description');
		flexPartImages.classList.add('flexPartImages');
		line1.classList.add('resultObjectLine');
		line2.classList.add('resultObjectLine');
		
		line1.style.display = 'none';
		line2.style.display = 'none';
		flexPartDescription.style.display = 'none';
		flexPartImages.style.display = 'none';
		
		blockRow.append(flexPartRanks, line1, flexPartDescription, line2, flexPartImages);
		
		let color = getRndInteger(0,360);
		
		const kingdom = document.createElement('div');
		const phylum = document.createElement('div');
		const classRank = document.createElement('div');
		const order = document.createElement('div');
		const family = document.createElement('div');
		const genus = document.createElement('div');
		const species = document.createElement('div');
		
		const taxaBlocks = [kingdom, phylum, classRank, order, family, genus, species];
	
		// ALL-IMAGES OBJECT FOR FULL WINDOW DISPLAY
		const imagesObject =
		{
			images: [],
			mediaCount: 0,
			occurrencesCount: 0,
			functionAddNextOccurrence: null,
			downloadedAllOccurrences: false,
			functionCheckCurrentlyFetching: null,
		};
		
		const rankProperties =
		{
			keyID: 0,
			canonicalName: "",
			color: 0, // HSL color unit: degrees °
			info: null,
			openedFirstTime: false,
			opened: false,
		};
		
		// THE GBIFResult OBJECT where everything is saved.
		const GBIFResult = 
		{
			// HTML ELEMENTS //
			wholeArea: blockRow, // entire result area
			
			// within wholeArea from top to bottom:
			// TOP
			ranks: flexPartRanks, // div which holds the taxaBlocks divs
			taxaBlocks: taxaBlocks, // array of taxaBlocks divs
			baseColor: color, // HSL color unit: degrees ° INTEGER ONLY
			arrow: null,
			// CENTER
			line1: line1,
			description: flexPartDescription, // holds everything that fetch.js yields, except MEDIA and OCCURRENCEs
			line2: line2,
			// BOTTOM
			images: flexPartImages, // this is the div that holds the IMG elements. NOT TO BE CONFUSED WITH 'imageObject.images', which holds the array of the same IMG elements.
			// END HTML ELEMENTS //
			
			// JS DATA //
			kingdom: structuredClone(rankProperties),
			phylum: structuredClone(rankProperties),
			class: structuredClone(rankProperties),
			order: structuredClone(rankProperties),
			family: structuredClone(rankProperties),
			genus: structuredClone(rankProperties),
			species: structuredClone(rankProperties),
			
			targetRank: rankSubmit,
			
			imagesObject: imagesObject,
			
			resultOpenedFirstTime: false,
			resultOpened: false,
			// END JS DATA //
		}
		allGBIFResults.push(GBIFResult);
		queryGroup.GBIFResults.push(GBIFResult);
		
		// CONSTRUCTING THE INDIVIDUAL taxaBlocks
		for (const y of ranks)
		{
			// earlier I had implemented:
			// id = Object.keys(data[x].higherClassificationMap)[taxaRankCounter];
			// the higherClassificationMap is convenient as it gives a list upwards (or downwards?) to the evolutionary root. But looping through the map only works as long as it has all the ranks. The problem is that sometimes there simply is no rank, so the list is just shorter, but you can't know which rank is missing as there're no rank names. So I had to come back to the ranks that are given in the fetch-object. If a rank is missing in the higherClassificationMap, it's also missing in fetch-object directly (species object).
			// E.g. "Draco melanopogon" (speciesKey: 5226226) doesn't have an order rank. And as you can see, it's missing both in the higherClassificationMap as well as in the species object.
			
			taxaBlocks[y].classList.add('baseBlock');
			taxaBlocks[y].style['background-color'] = `hsl(${color}, 50%, 50%)`;
			GBIFResult[taxaKeys[y]].color = color;
			color += 10;
			
			// STORING RANK AND KEY OF THE RANK OBJECT
			const taxaRank = taxaKeys[y];
			const rankNameKey = taxaKeys[y]+"Key";
			const keyID = data[x][rankNameKey];

			// THE TWO STRINGS THAT ARE DISPLAYED PER taxaBlock
			const rankClassification = document.createElement('div');
			const rankName = document.createElement('div');
			rankClassification.style['pointer-events'] = 'none';
			rankName.style['pointer-events'] = 'none';
			
			// IF RANK IS NOT MISSING
			if (data[x][taxaKeys[y]] !== undefined || keyID !== undefined) 
			{
				rankClassification.innerHTML = taxaKeys[y].toUpperCase();
				rankName.innerHTML = data[x][taxaKeys[y]];
				rankClassification.classList.add('rankClassification');
				taxaBlocks[y].append(rankClassification, rankName);
				
				const rankDescriptionContent = document.createElement('div');
				rankDescriptionContent.classList.add('rankDescription');
				flexPartDescription.append(rankDescriptionContent);

				GBIFResult[taxaKeys[y]].keyID = keyID;
				GBIFResult[taxaKeys[y]].canonicalName = data[x][taxaKeys[y]];
				GBIFResult[taxaKeys[y]].info = rankDescriptionContent;
							
				taxaBlocks[y].addEventListener('click',()=>{displayRank(GBIFResult, y)});
			}
			else
			{
				console.log(taxaKeys[y].toUpperCase() +" rank does not exist for "+data[x][rankSubmit]+", "+data[x][rankSubmit+"Key"]+", "+rankSubmit.toUpperCase());
				taxaBlocks[y].innerHTML = "<strong>"+taxaKeys[y].toUpperCase()+"</strong>:<br><i>No rank.</i>";
				taxaBlocks[y].style['cursor'] = 'auto'; 
				// Sometimes there just isn't the correct rank; the GBIF decided on the seven most basic / most backbone ranks. In truth there many more ranks, e.g. while the GBIF simply has ORDER, in biology there're also (wikipedia): Magnorder (magnus, 'large, great, important'), Superorder (super, 'above'), Grandorder (grand, 'large'), Mirorder	(mirus, 'wonderful, strange'), then actual ORDER, Suborder (sub, 'under'), Infraorder	(infra, 'below'), Parvorder	(parvus, 'small, unimportant'). An example would be Cetacea (whales): in GBIF they appear as an ORDER, but are actually an Infraorder. Some in-between ranks like toothed whales (Odontoceti) simply don't exist on the GBIF, even though it's a vast Parvorder that contains all the whales that have teeth, like Dolphins; and the FAMILY of dolphins (Delphinidae) has a Superfamily Delphinoidea and a Subfamily Delphininae... so while infraorder 'Whales' are moved to ORDER, sometimes taxonomy ranks are so off the 7 basic ranks which GBIF provides, that classifications simply aren't present on GBIF, like toothed whales.
			}
			
			if (taxaBlocks[y].innerHTML.search('No Rank.') === -1)
			{
				const theAni = taxaBlocks[y].animate(brightenHover(GBIFResult[taxaKeys[y]].color), fadeTime);
				theAni.pause();
				
				taxaBlocks[y].addEventListener('mouseover', () =>
				{
					rankClassification.style['color'] = 'deepskyblue';
					if (!GBIFResult[taxaKeys[y]].opened)
					{
						if (theAni.playbackRate === -1) theAni.playbackRate = 1;
						theAni.play();
						theAni.onfinish = ()=> taxaBlocks[y].style['background-color'] = 'hsl('+GBIFResult[taxaKeys[y]].color+', 70%, 70%)';
					} 
				})
				taxaBlocks[y].addEventListener('mouseout', () =>
				{
					rankClassification.style['color'] = 'white';
					if (!GBIFResult[taxaKeys[y]].opened)
					{
						theAni.reverse();
						theAni.onfinish = ()=>{taxaBlocks[y].style['background-color'] = 'hsl('+GBIFResult[taxaKeys[y]].color+', 50%, 50%)'};
						// I tried plugging into element.animate(brightenHover, {fill: "backwards", duration: fadeTime}) ... instead of fill: "backwards", I also tried animationDirection: "reverse", but none of these worked.
						// hint: you can't directly use onfinish on animation.cancel(), animation.reverse() or animation.finish() (which skips to finish). So you have to put the animation into a variable and expand it seperately with reverse() and onfinish.
					} 
				})
			}
			
			flexPartRanks.append(taxaBlocks[y]);
			if (taxaKeys[y] !== rankSubmit)
			{
				taxaBlocks[y].style.display = "none";
				rankClassification.style.color = "rgba(255,255,255,0)"; //...became a necessity for animation, see description in else-part of GBIFResultOpenClose()
				rankName.style.color = "rgba(255,255,255,0)";
			}
			if (taxaKeys[y] === rankSubmit) break; // if searched in rank GENUS, it will only create ranks until GENUS.
		}
		
		const arrow = document.createElement('div');
		flexPartRanks.append(arrow);
		arrow.classList.add('arrow');
		arrow.innerHTML = '⦿'; // ⪡ ⪢ ⋖ ⋗⩹⩺ ≪≫ ⦾⦿⊙ ⧀⧁ ⧏⧐ ⩹⩺⪢ ⪦⪧ ⪻⪼ ⫷⫸ ▢▣ ⋘⋙  ᗞ ᗡ ᗧ
		arrow.addEventListener('click', ()=> {GBIFResultOpenClose(GBIFResult, true)});
		GBIFResult.arrow = arrow;
	}
	constructFilter();
	createSummary();
}

function createSummary()
{
	while (resultOverview.children.length > 0) resultOverview.children[0].remove();
	for (const group of allQueriesGroups)
	{
		const statBlock = document.createElement('div');
		const info = document.createElement('div');
		info.style['pointer-events'] = 'none';
		//const rankClassification = document.createElement('div');
		//rankClassification.innerHTML = 
		//rankClassification.classList.add('rankClassification');
		info.innerHTML = group.GBIFResults.length+" results for <i><strong>"+group.name+"</i></strong><br>("+group.searchParameter.toUpperCase()+" search)";
		statBlock.classList.add('baseBlock', 'summery');
		statBlock.append(info);
		let moment = 0;
		let backgroundColorAni;
		let fontColorAni;
		
		statBlock.addEventListener('mouseover', ()=> statBlock.animate([{backgroundColor: '#409CB5'},{backgroundColor: '#86DBEF'}],fadeTime));
		statBlock.addEventListener('mouseout', ()=> statBlock.animate([{backgroundColor: '#86DBEF'},{backgroundColor: '#409CB5'}],fadeTime));
		statBlock.addEventListener('mousedown', ()=>
		{
			moment = new Date().getTime();
			statBlock.style['background-color'] = 'orange';
			statBlock.style.color = 'rgba(104, 75, 51, 0)';
			backgroundColorAni = statBlock.animate(removeAni('#86DBEF','orange'), 1000);
			fontColorAni = statBlock.animate(fontOpacityZeroToFull(104,75,51,false), 1000);
		});
		statBlock.addEventListener('mouseup', ()=>
		{
			if(new Date().getTime() - moment > 1000)
			{
				while (group.GBIFResults.length > 0) // it uses the pointers in the array of the group object to find the pointers in the array of allGBIFResults to remove the pointers (of the same GBIFResult) of allGBIFResults that belong to the group.
				{
					for (let x = 0; x <allGBIFResults.length; x++)
					{
						if (group.GBIFResults[0] === allGBIFResults[x])
						{
							allGBIFResults.splice(x,1);
							break;
						}
					}
					group.GBIFResults.shift();
				}
				if (resultOverview.children.length === 1)
				{
					resultOverview.animate(fadeOut,fadeTime).onfinish = ()=>{resultOverview.style.opacity = 0};
					filterArea.animate(fadeOut,fadeTime).onfinish = ()=>{filterArea.style.opacity = 0};
				}
				statBlock.animate(fadeOut, fadeTime).onfinish = ()=>
				{
					statBlock.remove();
					group.group.animate(fadeOut, fadeTime).onfinish = ()=>
					{
						group.group.remove();
						group.head.animate(fadeOut, fadeTime).onfinish = ()=>{group.head.remove()}
					}
				}
								
				for (let x = 0; x < allQueriesGroups.length; x++) if (group === allQueriesGroups[x]) allQueriesGroups.splice(x,1); // there shouldn't be any more references to the group object, so the garbage collector should remove it in the next interval.
				
				constructFilter();
			}
			else
			{
				backgroundColorAni.cancel();
				fontColorAni.cancel();
				statBlock.style.color = null;
				statBlock.style['background-color'] = null; // removes the added styling from mousedown. As I explain in displayRank() below: the styling attributes from classlist.add are seperate from directly-set styling attributes in JS (element.style.something...). Testing reveals that directly set-styling in JS ALWAYS has precedence over the classList styling; even if the classList is added later, it does not overwrite JS-coded styling. So here I remove the attributes again, instead of manually settiing the same attributes of the classList attributes in JS directly, to reverse it to the original (classList / CSS) style. This allows the hover style to be back in place. If I would here manually set the attributes from classList (like statBlock.style.color = 'white') it would look alright, but the hover would be gone. Also it's cleaner to remove it by setting it null, or you'd have to deal with to concurrent stylings.
				window.scrollBy(0, group.head.getBoundingClientRect().top);
			}
		});
		resultOverview.append(statBlock);
	}
}

function displayRank(GBIFResult, y)
{
	const r = GBIFResult;

	if (!r.resultOpenedFirstTime)
	{
		r.resultOpenedFirstTime = true;
		r.line1.style['border-color'] = r.taxaBlocks[taxaKeys.indexOf(r.targetRank)].style['background-color'];
		r.line2.style['border-color'] = r.taxaBlocks[taxaKeys.indexOf(r.targetRank)].style['background-color'];
	}
	
	if (r.resultOpened || (!r[r.targetRank].opened && !r.resultOpened)) // this if-else makes certain that you can open a GBIFResult by directly clicking on the targetRank taxaBlock, the only taxaBlock visible when GBIFResult is closed. Hence it must also make certain that you don't close the targetRank when you click on it while the GBIFResult is closed, but that in this case it stays opened (because you left the targetRank opened when you closed the GBIFResult over the 'arrow').
	{
		if (r[taxaKeys[y]].opened) r[taxaKeys[y]].opened = false;
		else r[taxaKeys[y]].opened = true;
		if (!r.resultOpened) GBIFResultOpenClose(GBIFResult, false, r[taxaKeys[y]].openedFirstTime); // meaning taxaKeys[y] === targetRank
	}
	else
	{
		GBIFResultOpenClose(GBIFResult, false); // ...yes I could just use 'r' as a parameter, but I like to be clear when using parameters.
		return;
	}
	
	// console.log("CLICKED ON RANK "+taxaKeys[y]+". IS OPENED: "+r[taxaKeys[y]].opened);
		
	// apparently a direct attribute check like flexPartDescription.style.display === 'flex' doesn't work if it's styled via classList (even though it gets display: 'flex' through the CSS class). Looking through the prototype attributes of flexPartDescription.style in the console reveals that all styling attributes are "", even though the CSS class attributes are clearly in effect. Only if it is here in JS explicitly expressed (flexPartDescription.style.display = 'flex'), then it would be having the attribute in the element styling prototype. So you have to keep interacting over classList functions and className once you use them. ... but you can mix it up: giving it a classList and then additionally a style via JS (like 'block'/'none' for convieniently switching it on/off) means that you can make bool compares, manipulate that particular style etc. but only with the style given through JS, not the ones given by classList.
	// why classList just doesn't write into the object style prototype? I don't know. You might assume it would make more sense. But that's JS for you.
	
	if (!r[taxaKeys[y]].openedFirstTime)
	{
		r[taxaKeys[y]].openedFirstTime = true;
		fetchEverything(GBIFResult, y);
		return;
	}
	
	let multiplicator = 0;
	if (r[taxaKeys[y]].info.className === 'rankDescription' && r[taxaKeys[y]].openedFirstTime) // the second if-condition makes certain that it doesn't instantly get hidden, when opening it for the first time. So for the first click, it goes to the 'else' and replaces 'rankDescription' with 'rankDescription', but that's not a problem.
	{
		for (const contentBlock of r[taxaKeys[y]].info.children) // cycles through the description blocks (center part) of a rank object like species
		{
			contentBlock.style.opacity = 1;
			setTimeout(()=>
			{
				contentBlock.animate(fadeOut, fadeTime/2).onfinish = ()=>{contentBlock.style.opacity = 0};
			},(fadeTime/3)*multiplicator);
			multiplicator++;
			if (multiplicator === r[taxaKeys[y]].info.children.length) setTimeout(()=>
			{
				r[taxaKeys[y]].info.classList.replace('rankDescription', 'hidden');
				if (r.description.getBoundingClientRect().height === 0) r.line2.animate(fadeOut,fadeTime).onfinish = ()=> {r.line2.style.display = 'none'};
			},(fadeTime/3)*multiplicator);
		}
	}
	else
	{
		r[taxaKeys[y]].info.classList.replace('hidden', 'rankDescription');
		r.taxaBlocks[y].animate(brighten(r[taxaKeys[y]].color),fadeTime).onfinish = ()=>
		{
			r.taxaBlocks[y].style['background-color'] = 'hsl('+r[taxaKeys[y]].color+', 70%, 70%)';
		} 
		for (const contentBlock of r[taxaKeys[y]].info.children)
		{
			contentBlock.style.opacity = 0;
			setTimeout(()=>
			{
				contentBlock.animate(fadeIn,fadeTime/2).onfinish = ()=>{contentBlock.style.opacity = 1};
			},(fadeTime/3)*multiplicator);
			multiplicator++;
			if (multiplicator === r[taxaKeys[y]].info.children.length) setTimeout(()=>
			{
				if (r.description.getBoundingClientRect().height > 0)
				{
					r.line2.style.display = 'block';
					r.line2.animate(fadeIn, fadeTime);
				}
			},(fadeTime/3)*multiplicator);
		}
	}
}

function GBIFResultOpenClose(GBIFResult, calledFromArrow, targetRankOpenedBefore)
{
	if (targetRankOpenedBefore === undefined) targetRankOpenedBefore = true;
	// targetRankOpenedBefore is false if the GBIFResult has never been opened before but is now opened for the first time via clicking on the targetRank (instead of arrow). If so, this boolean will prevent for the description part to be faded-in, which does already happen in fetch.js which got executed simultaneously to this function as it was opened for first time, meaning it would flicker once (faded-in twice), if it wasn't for this check.
	const r = GBIFResult;
	const b = GBIFResult.taxaBlocks;

	if (!r.resultOpened)
	{
		r.arrow.animate(fadeOut,fadeTime/2);
		b[taxaKeys.indexOf(r.targetRank)].animate(fadeOut,fadeTime/2).onfinish = ()=>
		{
			r.arrow.style.opacity = 0;
			b[taxaKeys.indexOf(r.targetRank)].style.opacity = 0;
			
			for (const y of ranks)
			{
				if (r[taxaKeys[y]].opened) // checks which one were opened before to brigthen the taxaBlock background
				{
					b[y].animate(brighten(r[taxaKeys[y]].color, true),fadeTime).onfinish = ()=>
					{
						b[y].style['background-color'] = 'hsl('+r[taxaKeys[y]].color+', 70%, 70%)';
					}
				}	
				if (taxaKeys[y] === r.targetRank)  // there only as many blocks until targetRank.
				{
					setTimeout(()=>
					{
						b[y].animate(expandFromLeft, fadeTime);
						b[y].animate(fadeIn, fadeTime).onfinish = ()=> b[y].style.opacity = 1;
						r.arrow.animate(fadeIn, fadeTime).onfinish = ()=> r.arrow.style.opacity = 1;
					},(fadeTime/1.5)*y);
					break;
				}
				setTimeout(()=>
				{
					b[y].style.display = "block";
					b[y].animate(fadeIn, fadeTime).onfinish = ()=>{b[y].style.opacity = 1}
					b[y].animate(expandFromLeft, fadeTime).onfinish = ()=>
					{
						b[y].children[0].animate(fontOpacityZeroToFull(255,255,255,true),fadeTime).onfinish = ()=>{b[y].children[0].style.color = "rgba(255,255,255,1)"}
						b[y].children[1].animate(fontOpacityZeroToFull(255,255,255,true), fadeTime*2).onfinish = ()=>{ b[y].children[1].style.color = "rgba(255,255,255,1)"}
					}
				},(fadeTime/1.5)*y);
			}
			r.resultOpened = true;
			r.arrow.innerHTML = '⊙';
			r.line1.style.display = 'block';
			r.description.style.display = 'flex';
			r.line2.style.display = 'block';
			r.images.style.display = 'block';
			r.line1.animate(fadeIn, fadeTime).onfinish = ()=>
			{
				r.line1.style.opacity = 1;
				if (targetRankOpenedBefore)
				{
					r.description.animate(fadeIn, fadeTime).onfinish = ()=>
					{
						r.description.style.opacity = 1;
						r.line2.animate(fadeIn, fadeTime).onfinish = ()=>
						{
							r.line2.style.opacity = 1;
							r.images.animate(fadeIn, fadeTime).onfinish = ()=>{r.images.style.opacity = 1};
						}
					}
				}
				else
				{
					r.line2.animate(fadeIn, fadeTime).onfinish = ()=>
					{
						r.line2.style.opacity = 1;
						r.images.animate(fadeIn, fadeTime).onfinish = ()=>{r.images.style.opacity = 1};
					}
				}
			}
			if (r.imagesObject.functionAddNextOccurrence !== null && r.images.scrollWidth === r.images.offsetWidth) {console.log('REMOTE FETCH CALL + continuing trying to fill white space with images'); r.imagesObject.functionAddNextOccurrence()}; // this is for the rather rare case when the user closes the GBIFResult BEFORE it had fetched enough images to fill the horizontal space. The checkWidth() function fires only once when the user opens a result for the first time, but it would get aborted (by a check in addNextImage()) if the user would close GBIFResult before it would fill the horizontal r.images. Hence this if-check;
		}
	}
	else
	{
		for (const y of ranks)
		{ 	
			if (y < taxaKeys.indexOf(r.targetRank)) b[y].children[0].animate(fontOpacityZeroToFull(255,255,255,false), fadeTime).onfinish = ()=> {b[y].children[0].style.color = "rgba(255,255,255,0)";};
			if (y < taxaKeys.indexOf(r.targetRank)) b[y].children[1].animate(fontOpacityZeroToFull(255,255,255,false), fadeTime).onfinish = ()=> {b[y].children[1].style.color = "rgba(255,255,255,0)";};
			// I have to explicitly set the opacities of the two text-divs to 0, because the styling of rankClassification (first child) can get overwritten from the mouseout-event.
			setTimeout(()=>
			{
				if (y < taxaKeys.indexOf(r.targetRank)) b[y].children[1].style.color = "rgba(255,255,255,0)";
				setTimeout(()=>
				{
					r.arrow.animate(fadeOut,fadeTime).onfinish = ()=>{r.arrow.style.opacity = 0};
					b[y].animate(fadeOut, fadeTime).onfinish = ()=>
					{ 
						b[y].style.opacity = 0;

						if (taxaKeys[y] !== r.targetRank) b[y].style.display = "none";
						else b[y].animate(fadeIn,fadeTime).onfinish = ()=>
						{
							b[y].style.opacity = 1;
							if (r[taxaKeys[y]].opened) b[y].animate(brighten(r[taxaKeys[y]].color, false),fadeTime).onfinish = ()=>
							{
								b[y].style['background-color'] = 'hsl('+r[taxaKeys[y]].color+', 50%, 50%)';
							}
						}
						r.arrow.animate(fadeIn, fadeTime).onfinish = ()=>{r.arrow.style.opacity = 1}
						// (earlier I used for-in loop and wrote this): it's unexpected to me how 'y' is not undefined, but is literally saved in the setTimeouts for every cycle. The loop has long finished when the first animations start. The interpreter doesn't wait for .animation, .onfinish or setTimeout. So the peripheral y should be gone, but it's not. Anyways, more convenient this way. I can only explain it that the interpreter literally takes a snapshot of the setTimeout arrow function on every cycle, and replaces y with the value. Usually you get errors from functions only once they get executed, not just execution errors but also errors like undeclared varaibles are only realized on function execution, meaning the interpreter never looked at the function body before. But in this case it does apparently read the arrow functions before execution.
						// a moment later and I know now why. Having scrolled up after writing the upper line, I see the for-in loop and have a hunch, so I replace it with a classical for-loop and get undefineds as expected. Next stop is the MDN doc and everything becomes clear. It was a mistake to assume JS for...ins are like the ones in Python, they're very different. The intention of the JS for...in is to BECOME the key, in this case it's the indeces of the array. Because it reads keys as strings, it places the stringified indeces all over the loop-content aka setTimeout content, the interpreter then takes the string-number as a number and it works. JS for...ins have been designed to iterate through objects, hence the ability for y to become the key to access the values; so it iterates through the array-objects ("Array indexes are just enumerable properties with integer names and are otherwise identical to general object properties."), which makes them slower. They'll skip empty values, will yield added prototype properties, and are not guaranteed to keep order of array-elements, though I never had problems. That's why, while not considered bad practice, for-ins are generally not recommended for arrays outside of development.
						// But ironically, the fact that I didn't know about this before made everything work conveniently. ... it's sad, for-ins are so much more comfortable to write, I assumed originally this was their design purpose. Because it's literally a silly thing to write x<something.length, and also the something++ every time. Most of the time you just want to iterate from beginning, slot by slot, throw in a break if you want to get out earlier. for...of traverses the elements themselves, so for-in was literally the only one that would generate indeces from arrays with objects like taxaBlocks. I'm now annoyed that JS doesn't provide a lookable syntax for a loop that just automatically produces indeces and automatically iterates to end, like Python for...ins. for-of loops don't deliver as soon as you have various things going on that depend on the indeces.
						// Because of that I simply created an array 'ranks' (in startup.js) with integers of taxaKeys.length and use it to swap the for-ins with for-ofs.
					}
				},fadeTime);
			},fadeTime);
		}
		r.images.animate(fadeOut, fadeTime/2).onfinish = ()=>
		{
			r.images.style.opacity = 0;
			r.line2.animate(fadeOut, fadeTime/2).onfinish = ()=>
			{
				r.line2.style.opacity = 0;
				r.description.animate(fadeOut, fadeTime).onfinish = ()=>
				{
					r.description.style.opacity = 0;
					r.line1.animate(fadeOut, fadeTime).onfinish = ()=>
					{
						r.line1.style.opacity = 0;
						r.line1.style.display = 'none';
						r.images.style.display = 'none';
						r.line2.style.display = 'none';
						r.description.style.display = 'none';
					}
				}
			}
		}
		r.resultOpened = false;
		r.arrow.innerHTML = '⦿';
	}
	calledFromArrow = false;
}

function getRndInteger(min, max)
{
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export {create, allGBIFResults};