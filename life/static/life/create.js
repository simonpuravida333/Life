import {taxaKeys, ranks, resultOverview, filterArea, isMobile, touch} from './startup.js';
import {svg, svg2, fadeTime, fadeIn, fadeOut, contractXToCenter, expandXFromCenter, fontOpacityZeroToFull, brightenHover, removeAni} from './animation.js';
import {constructFilter} from './filter.js';
import {displayRank, GBIFResultOpenClose} from './navigate.js';

// + + + CLARIFICATION + + +
// KINGDOM is on top, SPECIES is on the bottom. ... it's all a matter how you look at it. If you think of the "tree of life", then kingdom would be on the bottom / the trunk, with SPECIES being the branches high up. But lets look at kingdom as the over-arching dome under which everything else falls. ...For the case when I comment about 'higher' or 'lower' ranks.
// "GBIF result" is the whole object that appears when querying, it can contain up to seven ranks / up to SPECIES.
// "rank object" is one of the up to seven ranks that a GBIF result can contain, each having its own clickable block in the top section that displays / hides its description part in the middle section

const body = document.querySelector('body');
const allGBIFResults = [];
const allQueriesGroups = []; // this one will also have all the GBIFResults as allGBIFResults does, but collected as groups. I still decided to also keep allGBIFResults, because it makes going through all elements easier. In allQueriesGroups I would always have to use two loops, the outer one going from group to group, the inner going through the GBIFResults. That's a hassle, and so I just keep both arrays. And thankfully so, in the end only one case came up where I have to synchronize them (when removing a group, in createSummery()).

function create(data, querySubmit, rankSubmit)
{
	if (resultOverview.style.opacity < 0.9) resultOverview.animate(fadeIn, fadeTime).onfinish = ()=>resultOverview.style.opacity = 1;
	if (filterArea.style.opacity < 0.9) filterArea.animate(fadeIn, fadeTime).onfinish = ()=> filterArea.style.opacity = 1; // why 0.9? becuase maybe the user is so fast and hits enter on a pre-typed text just after having deleted a group. It's highly unlikely though.
	
	if (data === 'nothingFetched')
	{
		createSummary(data, querySubmit);
		return;
	}
	
	console.log(querySubmit, rankSubmit, data);
	let withinHigherTaxa = false;
	if (rankSubmit.search('within') !== -1) withinHigherTaxa = true;
	
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
			circle1.animate(fadeOut,fadeTime).onfinish = ()=> circle1.style.opacity = 0;
			circle2.animate(fadeOut,fadeTime).onfinish = ()=> circle1.style.opacity = 0;
			line1.animate(contractXToCenter,500).onfinish = ()=> line1.style.display = 'none';
			line2.animate(contractXToCenter,500).onfinish = ()=>
			{
				circle1.animate(fadeIn,fadeTime).onfinish = ()=> circle1.style.opacity = 1;
				circle2.animate(fadeIn,fadeTime).onfinish = ()=> circle1.style.opacity = 1;
				line2.style.display = 'none';
				groupResults.animate(fadeOut,500).onfinish = ()=> groupResults.style.display = 'none';
			};
		} 
		else 
		{
			circle1.animate(fadeOut,fadeTime).onfinish = ()=> circle1.style.opacity = 0;
			circle2.animate(fadeOut,fadeTime).onfinish = ()=>
			{
				circle2.style.opacity = 0;
				line1.style.display = 'block';
				line2.style.display = 'block';
				line1.animate(expandXFromCenter,500); // using contractXToCenter with reverse() wouldn't perfectly work visually.
				line2.animate(expandXFromCenter,500).onfinish = ()=>
				{
					circle1.animate(fadeIn,fadeTime).onfinish = ()=> circle1.style.opacity = 1;
					circle2.animate(fadeIn,fadeTime).onfinish = ()=> circle2.style.opacity = 1;
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
	twoDArray.sort(); // will automatically sort the array by reading the first slot of the first dimension.
	data = [];
	for (const eachArr of twoDArray) data.push(eachArr[1]);
	// END SORT
	
	for (let x = 0; x < data.length; x++)
	{	
		// FILTER
		if(data[x].synonym === true) continue;
		if(rankSubmit !== 'any' && rankSubmit !== 'canonicalName' && rankSubmit !== 'highestRank' && rankSubmit !== 'keyID' && rankSubmit.toUpperCase() !== data[x].rank && !withinHigherTaxa) continue;
		// ENDFILTER
		
		rankSubmit = data[x].rank.toLowerCase(); // to get a rank, onto which create.js relies, in case user queried with 'any', 'canonicalName', 'highestRank', or 'keyID'
		// 'targetRank' in the GBIFResult object is the rank the user searched for: the lowest rank (target) is always displayed, also when the GBIF result is closed. If you searched for a FAMILY, the FAMILY taxaBlock is always displayed (upper ranks ORDER, CLASS... are hidden), meaning FAMILY is the lowest rank / is the targetRank
		
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
		const mobileFullWidthImageDiv = document.createElement('div');
		const mobileFullWidthImage = document.createElement('IMG');
		mobileFullWidthImageDiv.append(mobileFullWidthImage);
		
		flexPartRanks.classList.add('flexPart');
		flexPartDescription.classList.add('flexPart', 'description');
		flexPartImages.classList.add('flexPartImages');
		mobileFullWidthImageDiv.classList.add('mobileFullWidthImageDiv');
		mobileFullWidthImage.classList.add('mobileFullWidthImage');
		line1.classList.add('resultObjectLine');
		line2.classList.add('resultObjectLine');
		
		line1.style.display = 'none';
		line2.style.display = 'none';
		flexPartDescription.style.display = 'none';
		flexPartImages.style.display = 'none';
		mobileFullWidthImageDiv.style.display = 'none';
		
		blockRow.append(flexPartRanks, line1, flexPartDescription, line2, flexPartImages, mobileFullWidthImageDiv);
		
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
			images: flexPartImages, // this is the div that holds the IMG elements. NOT TO BE CONFUSED WITH 'imagesObject.images', which holds the array of the same IMG elements.
			mobileFullWidthImageDiv: mobileFullWidthImageDiv,
			mobileFullWidthImage: mobileFullWidthImage,
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
				// Sometimes there just isn't the correct rank; the GBIF decided on the seven most basic / most backbone ranks. In truth there many more ranks, e.g. while the GBIF simply has ORDER, in biology there're also (wikipedia) (from top downwards): Magnorder (magnus, 'large, great, important'), Superorder (super, 'above'), Grandorder (grand, 'large'), Mirorder	(mirus, 'wonderful, strange'), then actual ORDER, Suborder (sub, 'under'), Infraorder	(infra, 'below'), Parvorder	(parvus, 'small, unimportant'). An example would be Cetacea (whales): in GBIF they appear as an ORDER, but are actually an Infraorder. Some in-between ranks like toothed whales (Odontoceti) simply don't exist on the GBIF, even though it's a vast Parvorder that contains all the whales that have teeth, like Dolphins; and the FAMILY of dolphins (Delphinidae) has a Superfamily Delphinoidea and a Subfamily Delphininae... so while infraorder 'Whales' are moved to ORDER, sometimes taxonomy ranks are so off the 7 basic ranks which GBIF provides, that classifications simply aren't present on GBIF, like toothed whales.
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
						// I tried plugging into element.animate(brightenHover, {fill: "backwards", duration: fadeTime}), I also tried animationDirection: "reverse", but none of these worked.
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

function createSummary(nothingFetched, querySubmit)
{
	if (nothingFetched !== undefined)
	{
		const statBlock = document.createElement('div');
		const info = document.createElement('div');
		info.style['pointer-events'] = 'none';
		statBlock.classList.add('baseBlock', 'summery');
		statBlock.append(info);
		resultOverview.append(statBlock);
		info.innerHTML = "Nothing found for <i><strong>"+querySubmit+"</i></strong>";
		statBlock.animate({backgroundColor: ['rgba(255,80,50,1)','rgba(255,80,50,0.65)','rgba(255,80,50,1)','rgba(255,50,50,0)']},3000).onfinish =()=>
		{
			statBlock.style.opacity = 0;
			if (resultOverview.children.length === 1)
			{
				resultOverview.animate(fadeOut,fadeTime).onfinish = ()=>
				{
					resultOverview.style.opacity = 0;
					statBlock.remove();
				}
				filterArea.animate(fadeOut,fadeTime).onfinish = ()=> filterArea.style.opacity = 0;
			}
			else statBlock.remove();
		}
		return;
	}
	
	while (resultOverview.children.length > 0) resultOverview.children[0].remove();
	for (const group of allQueriesGroups)
	{
		const statBlock = document.createElement('div');
		const info = document.createElement('div');
		info.style['pointer-events'] = 'none';

		let corrected = '';
		if (group.searchParameter === 'canonicalName') corrected = 'canonical name';
		else if (group.searchParameter === 'highestRank') corrected = 'highest rank';
		else corrected = group.searchParameter;
		info.innerHTML = "<i><strong>"+group.GBIFResults.length+"</i></strong> results for <i><strong>"+group.name+"</i></strong><br>(<i><strong>"+corrected.toUpperCase()+"</strong></i> search)";
		statBlock.classList.add('baseBlock', 'summery');
		statBlock.append(info);
		
		let moment = 0;
		let backgroundColorAni;
		let fontColorAni;
		statBlock.addEventListener('mouseover', ()=> statBlock.animate([{backgroundColor: '#409CB5'},{backgroundColor: '#86DBEF'}],fadeTime));
		statBlock.addEventListener('mouseout', ()=> statBlock.animate([{backgroundColor: '#86DBEF'},{backgroundColor: '#409CB5'}],fadeTime));
		resultOverview.append(statBlock);
		
		if (touch)
		{
			statBlock.addEventListener('touchstart', holdDown);
			statBlock.addEventListener('touchend', holdEnd);
		}
		else
		{
			statBlock.addEventListener('mousedown', holdDown);
			statBlock.addEventListener('mouseup', holdEnd);
		}
		function holdDown()
		{
			moment = new Date().getTime();
			statBlock.style['background-color'] = 'orange';
			statBlock.style.color = 'rgba(104, 75, 51, 0)';
			backgroundColorAni = statBlock.animate(removeAni('#86DBEF','orange'), 1000);
			fontColorAni = statBlock.animate(fontOpacityZeroToFull(104,75,51,false), 1000);
		}
		function holdEnd()
		{
			if(new Date().getTime() - moment > 1000)
			{
				while (group.GBIFResults.length > 0) // it uses the pointers in the array of the group object to find the pointers in the array of allGBIFResults to remove the pointers (of the same GBIFResult) of allGBIFResults that belong to the group.
				{
					for (let x = 0; x < allGBIFResults.length; x++)
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
					resultOverview.animate(fadeOut,fadeTime).onfinish = ()=> resultOverview.style.opacity = 0;
					filterArea.animate(fadeOut,fadeTime).onfinish = ()=> filterArea.style.opacity = 0;
				}
				statBlock.animate(fadeOut, fadeTime).onfinish = ()=>
				{
					statBlock.remove();
					group.group.animate(fadeOut, fadeTime).onfinish = ()=>
					{
						group.group.remove();
						group.head.animate(fadeOut, fadeTime).onfinish = ()=> group.head.remove();
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
				statBlock.style['background-color'] = null; // removes the added styling from mousedown. As I explain in displayRank() below: the styling attributes from classlist.add are seperate from directly-set styling attributes in JS (element.style.something...). Testing reveals that directly set-styling in JS ALWAYS has precedence over the classList styling; even if the classList is added later, it does not overwrite JS-coded styling. So here I remove the attributes again, instead of manually setting the same attributes of the classList attributes in JS directly, to reverse it to the original (classList / CSS) style. This allows the hover style to be back in place. If I would here manually set the attributes from classList (like statBlock.style.color = 'white') it would look alright, but the hover would be gone. Also it's cleaner to remove it by setting it null, or you'd have to deal with two concurrent stylings.
				let zoom = 1;
				if (isMobile) zoom = body.style.zoom;
				window.scrollTo(0, group.head.offsetTop*zoom);
			}
		}
	}
}

function getRndInteger(min, max)
{
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export {create, allGBIFResults, getRndInteger};