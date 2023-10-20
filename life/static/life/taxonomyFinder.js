import {newSpeciesSpace, parentSelection, parentSelectionChange} from './newSpecies.js';
import {newOccurrenceSpace, speciesSelection, speciesSelectionChange} from './newOccurrence.js';
import touchResponse from './swipe.js';
var inputSearch;

const body = document.querySelector('body');
const taxaNavigator = g();
taxaNavigator.classList.add('blockRow');
taxaNavigator.style.display = 'none';

const topBar = newSpeciesSpace.children[0].cloneNode(true);
if (!isMobile)
{
	topBar.children[1].innerHTML = 'TAXONOMY NAVIGATOR';
	topBar.children[3].onmouseover = ()=> topBar.children[3].innerHTML = '⦿';
	topBar.children[3].onmouseout = ()=> topBar.children[3].innerHTML = '⊙';
	topBar.children[3].onclick = ()=> taxaNavigator.animate({opacity: [1,0]},333).onfinish = ()=> taxaNavigator.style.display = 'none';
}
else topBar.children[0].innerHTML = 'TAXONOMY NAVIGATOR';
taxaNavigator.append(topBar);

const information = g();
information.innerHTML = 'Look for canonical name suggestions in any rank you want.<br>To refresh everything, delete the name of the highest taxonomy.';
information.style['text-align'] = 'center';
information.style['font-size'] = '18px';
taxaNavigator.append(information);

// RANKS FINDER
const findRanks = new Array(7);
const rankDivisions = new Array(7);
const spacesForSuggestions = new Array(7);

const showLimit = 50;

constructInputFields();
async function constructInputFields()
{
	const startupModule = await import('./startup.js'); // startup.js loads last.
	inputSearch = startupModule.inputSearch;
	
	for (const rank of ranks)
	{
		rankDivisions[rank] = g();
		rankDivisions[rank].style['margin-top'] = '20px';
		const title = g();
		title.classList.add('selectTitle' ,'newSpeciesLabel');
		title.style['text-align'] = 'center';
		title.innerHTML = taxaKeys[rank].toUpperCase();
		findRanks[rank] = g('in');
		findRanks[rank].classList.add('input', 'findRank');
		if (rank % 2 === 0) findRanks[rank].style['border-radius'] = '5px 40px 5px 40px';
		else findRanks[rank].style['border-radius'] = '40px 5px 40px 5px';
		spacesForSuggestions[rank] = g();
		spacesForSuggestions[rank].classList.add('flexPart');
		rankDivisions[rank].append(title, findRanks[rank], spacesForSuggestions[rank]);
		taxaNavigator.append(rankDivisions[rank]);
		//division.style.width = findRanks[rank].getBoundingClientRect().width+20+'px';
		//division.style.margin = "0 auto";
	}
	
	const typeMoments = [];
	
	for (const rank of ranks	) rankDivisions[rank].children[1].oninput= async (action)=>
	{
		typeMoments.push(new Date().getTime());
		let avg = 0;
		for (let x = 0; x< typeMoments.length-1; x++) avg += typeMoments[x+1] - typeMoments[x];
		//console.log(avg/typeMoments.length);
		
		for (let space = rank; space < ranks.length; space++) spacesForSuggestions[space].innerHTML = "";
		if (findRanks[rank].value === "")
		{
			for (const counter of ranks) if (counter > rank)
			{
				rankDivisions[counter].children[0].style.display = 'block'; // title
				findRanks[counter].style.display = 'block';
				rankDivisions[counter].children[0].style.opacity = 0;
				findRanks[counter].style.opacity = 0;
				setTimeout(()=>
				{
					rankDivisions[counter].children[0].animate({opacity: [0,1]},500).onfinish = ()=> rankDivisions[counter].children[0].style.opacity = 1;
					findRanks[counter].animate({opacity: [0,1]},500).onfinish = ()=> findRanks[counter].style.opacity = 1;
				},200*(counter-rank-1));
				findRanks[counter].value = "";		
			}
			return;
		}
		
		for (const counter of ranks) if (counter > rank)
		{
			rankDivisions[counter].children[0].style.display = 'none';
			findRanks[counter].style.display = 'none';
		}

		fetch('https://api.gbif.org/v1/species/suggest?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=50&rank='+taxaKeys[rank]+'&q='+findRanks[rank].value)
		.then(response => response.json())
		.then(suggestions =>
		{
			spacesForSuggestions[rank].append(suggestionTitle(taxaKeys[rank].toUpperCase()+" suggestions for <i>"+findRanks[rank].value+'<i>'));
			
			suggestions = filterResults(suggestions);
			let colorDegree = randomInt(0,360);
			const previousClick = {element: null, backgroundColor: null}
			
			for (const suggestion in suggestions)
			{
				colorDegree += 4;
				const aSuggestion = createSuggestionBlock(colorDegree);
				aSuggestion.innerHTML	= suggestions[suggestion].canonicalName;
				spacesForSuggestions[rank].append(aSuggestion);
				setTimeout(()=>
				{
					aSuggestion.animate({opacity: [0,1]},300).onfinish = ()=> aSuggestion.style.opacity = 1;
				},20*suggestion);
				aSuggestion.onclick = ()=>
				{
					suggestionBlockClickStyling(aSuggestion, previousClick);
					for (const space in spacesForSuggestions) if (space != rank) spacesForSuggestions[space].innerHTML = ""; // clears suggestion collections of other ranks if you type into a different rank (to get new suggestions). // caution: rank is an integer while space is a stringified integer (for-in loop). So it needs implicit comparision. // while (spacesForSuggestions[space].children.length > 0)spacesForSuggestions[space].children[0].remove();
					setSelection(suggestions[suggestion]);
					getClickedSelection(suggestions[suggestion]);
				}
			}
		});
	}
}

function createSuggestionBlock(colorDegree)
{
	const block = g();
	block.classList.add('suggestionBlock', 'brightHover');
	block.style['background-color'] = 'hsl('+colorDegree+', 80%, 80%)';
	//block.onmouseover = ()=> block.style['background-color'] = 'hsl('+colorDegree+', 90%, 90%)';
	//block.onmouseout = ()=> block.style['background-color'] = 'hsl('+colorDegree+', 80%, 80%)';
	return block;
}

function suggestionBlockClickStyling(newClick, previousClick)
{
	if (previousClick.element !== null)
	{
		previousClick.element.style = null;
		previousClick.element.style.opacity = 1;
		previousClick.element.style.backgroundColor = previousClick.backgroundColor;
		previousClick.element.innerHTML = previousClick.element.innerHTML.slice(0,1)+previousClick.element.innerHTML.slice(1).toLowerCase();
		/*
		const numbersRGB = previousClick.backgroundColor.match(/\d+/g);
		const numbersHSL = RGBToHSL(numbersRGB[0], numbersRGB[1], numbersRGB[2]);
		previousClick.onmouseover = ()=> previousClick.style['background-color'] = 'hsl('+numbersHSL[0]+', 90%, 90%)';
		previousClick.onmouseout = ()=> previousClick.style['background-color'] = 'hsl('+numbersHSL[0]+', 80%, 80%)';
		*/
	}
	previousClick.element = newClick;
	previousClick.backgroundColor = newClick.style.backgroundColor;
	
	newClick.style['background-color'] = 'white';
	newClick.style['border-color'] = 'deepskyblue';
	newClick.style['font-weight'] = 600;
	newClick.style['letter-spacing'] = '0.2em';
	newClick.style['font-style'] = 'italic';
	newClick.style.color = '#2A4051';
	//newClick.onmouseover = null;
	//newClick.onmouseout = null;
	newClick.innerHTML = newClick.innerHTML.toUpperCase();
}

function setSelection(GBIFObject)
{
	//console.log(GBIFObject)
	for (const input of findRanks)
	{
		input.style['font-style'] = null;
		input.style['font-weight'] = null;
		input.style.color = null;
	}
	let theRank = Number(taxaKeys.indexOf(GBIFObject.rank.toLowerCase()));
	for (let countBack = ranks.length-1; countBack > -1; countBack--)
	{
		if (countBack > theRank) findRanks[countBack].value = "";
		else if (GBIFObject[taxaKeys[countBack]] === undefined)
		{
			findRanks[countBack].value = 'No rank.';
			findRanks[countBack].style['font-style'] = 'italic';
			findRanks[countBack].style['font-weight'] = 'bold';
			findRanks[countBack].style.color = '#FFE843';
		}
		else findRanks[countBack].value = GBIFObject[taxaKeys[countBack]];
	}
	if (theRank < 6) fetchChildren(GBIFObject, theRank+1);
}

function fetchChildren (parent, childRank)
{
	const variousRanks = {};
	
	fetchUntilExhausted(1000, 0, childRank);
	function fetchUntilExhausted(limit, offset)
	{
		fetch('https://api.gbif.org/v1/species/'+parent.key+'/children?limit='+limit+'&offset='+offset+'&isExtinct=false') // isExtinct doesn't work on children, and within the children themselves there's no data about extinct / extant. A LOT of the children are of extinct species - recognizable by having lineage of two, three or four missing ancestors, like Genus being the direct children of Animalia. For this app, they're annoying, as most provide practically no data.
		.then(response => response.json())
		.then(incoming =>
		{
			if (incoming.results.length === 0)
			{
				const infoTitle = suggestionTitle('There are no children for '+ parent.rank.slice(0,1) + parent.rank.slice(1).toLowerCase() + ' <i>'+ ((parent.canonicalName !== undefined) ? parent.canonicalName : parent.scientificName) + '</i>');
					spacesForSuggestions[childRank].append(infoTitle);
				return;
			}
			
			let presentRank = taxaKeys.indexOf(incoming.results[0].rank.toLowerCase()); // highest-ranked children should always come first.
			const packageOfChildren = [];
			
			for (const child of incoming.results)
			{
				if (child.rank !== taxaKeys[presentRank].toUpperCase())
				{
					allChildren(presentRank);
					if (child.rank === 'UNRANKED') return;
					presentRank = taxaKeys.indexOf(child.rank.toLowerCase()); // presentRank++ may not work as the next child is more distant / not direct
				}
				if (variousRanks[child.rank] === undefined) variousRanks[child.rank] = [];
				variousRanks[child.rank].push(child);
			}
			if (incoming.endOfRecords === true)
			{
				allChildren(presentRank);
				return;
			}
			fetchUntilExhausted(1000, incoming.offset+1000)
		})
	}
	
	function allChildren(rank)
	{
		variousRanks[taxaKeys[rank].toUpperCase()] = filterResults(variousRanks[taxaKeys[rank].toUpperCase()]);
		if (variousRanks[taxaKeys[rank].toUpperCase()].length === 0) return;
		
		let highestRank = 6; 
		for (const various in variousRanks) if (various !== 'UNRANKED' && Number(taxaKeys.indexOf(various.toLowerCase())) < highestRank) highestRank = Number(taxaKeys.indexOf(various.toLowerCase()));
		if (highestRank > childRank)
		{
			const infoTitle = suggestionTitle('The next direct '+ ((variousRanks[taxaKeys[rank].toUpperCase()].length > 1) ? 'children' : 'child') +' for '+ parent.rank.slice(0,1) + parent.rank.slice(1).toLowerCase() + ' <i>'+ ((parent.canonicalName !== undefined) ? parent.canonicalName : parent.scientificName) + '</i> ' + ((variousRanks[taxaKeys[highestRank].toUpperCase()].length > 1) ? 'are' : 'is') +' of rank ' + taxaKeys[highestRank].slice(0,1).toUpperCase() + taxaKeys[highestRank].slice(1));
			infoTitle.children[1].style.color = 'orange';
			spacesForSuggestions[childRank].append(infoTitle);
		}
		
		displayChildren(variousRanks[taxaKeys[rank].toUpperCase()]);
		function displayChildren(directChildren, unranked)
		{
			showInfoTitle(directChildren.length, parent, rank, unranked);
			makeChildren(directChildren, rank);
		}
		
		if (variousRanks['UNRANKED'] !== undefined)
		{
			let unrankedChildren = [];
			for (const child of variousRanks['UNRANKED']) if (child.parentKey === parent.key) unrankedChildren.push(child);
			displayChildren(unrankedChildren, 'UNRANKED');
		}
	}
}

function FORMER_fetchChildren(parent, childRank) // works perfectly 
{
	fetch('https://api.gbif.org/v1/species/'+parent.key+'/children?limit=1000&isExtinct=false')
	.then(response => response.json())
	.then(children =>
	{
		console.log(children);
		children = filterResults(children.results);
		if (children.length === 0)
		{
			//if (childRank+1 < 7) fetchGrandchildren(parent, childRank+1);
			return;
		}
		const variousRanks = {};
		// GBIF may send more distant generations / ranks of children. There are two kinds of more distant children: first are the important ones that are direct children but more distant children. You can see that when looking through the result object of children where as a parent a more distant generation / rank is given. Second, there are "overspill-children": if there are less direct children than the fetch-limit-parameter, GBIF will simply send additional children of the next / lower rank. In this case they aren't direct children, but grand-children. ...I was first oblivious to this fact, not knowing that the GBIF always uses the limit, even if it isn't given as a parameter, as it was in my case: so it uses the default limit of 20. I was assuming it would yield every direct child. But when I looked over the results I became suspicious that it would find 16 classes for phylum 'Chordata' plus 4 orders that all began with 'A'. Remembering that the standard limit (for other fetch calls) was twenty, it dawned to me that it doesn't at all send me a complete direct children package. So now I've set a limit and put it to max (1000) of which I only take the most direct ones, making certain I get all of them.
		// In case there are no direct children (rank missing) but more distant children that have not directly set a distant parent (the ones that wouldn't appear for children-fetch), I use fetchGrandchildren (and grand-grand...) which uses a different API call. // NOTE: fetchGrandchildren is deactivated. As this module evolved it became obsolete.
		// IMPORTANT: sometimes GBIF sends multiple distant direct children of various distant ranks, like species and genera within same one parent phylum.
		for (const child of children) variousRanks[child.rank] = [];
		for (const child of children) variousRanks[child.rank].push(child);			
		let highestRank = 6; // remember, the higher the rank, the lower the number: kingdom = 0, species = 6. What we are doing here is to find the least-distant children. So if within a phylum we get genera and species as children, we want the genera first, that would be the highest rank among the children.
		for (const various in variousRanks) if (various !== 'UNRANKED' && Number(taxaKeys.indexOf(various.toLowerCase())) < highestRank) highestRank = Number(taxaKeys.indexOf(various.toLowerCase())); // 'UNRANKED' would make indexOf return a -1, which would then get chosen.

		if (highestRank > childRank) // ... but first we have to know if we are not given direct children, but more distant ones.
		{
			const infoTitle = suggestionTitle('The next direct '+ ((children.length > 1) ? 'children' : 'child') +' for '+ parent.rank.slice(0,1) + parent.rank.slice(1).toLowerCase() + ' <i>'+ ((parent.canonicalName !== undefined) ? parent.canonicalName : parent.scientificName) + '</i> ' + ((variousRanks[taxaKeys[highestRank].toUpperCase()].length > 1) ? 'are' : 'is') +' of rank ' + taxaKeys[highestRank].slice(0,1).toUpperCase() + taxaKeys[highestRank].slice(1));
			infoTitle.children[1].style.color = 'orange';
			spacesForSuggestions[childRank].append(infoTitle);
		}
		displayChildren(variousRanks[taxaKeys[highestRank].toUpperCase()]);
		
		function displayChildren(directChildren, unranked)
		{
			showInfoTitle(directChildren.length, parent, highestRank, unranked);
			makeChildren(directChildren, highestRank);
		}
		
		while (highestRank < 6) // find more distant direct children
		{
			highestRank++;
			while (variousRanks[taxaKeys[highestRank].toUpperCase()] === undefined && highestRank < 6) highestRank++;
			if (variousRanks[taxaKeys[highestRank].toUpperCase()] === undefined) break; // if highestRank = 6 is undefined.

			let directChildren = [];
			for (const child of variousRanks[taxaKeys[highestRank].toUpperCase()]) if (child.parentKey === parent.key) directChildren.push(child);
			displayChildren(directChildren);
		}
		
		if (variousRanks['UNRANKED'] !== undefined)
		{
			let unrankedChildren = [];
			for (const child of variousRanks['UNRANKED']) if (child.parentKey === parent.key) unrankedChildren.push(child);
			displayChildren(unrankedChildren, 'UNRANKED');
		}
	})
}

function fetchGrandchildren(grandparent, theRank) // this function has become obsolete
{
	console.log("- - - FETCHING GRAND CHILDREN - - -")
	fetch('https://api.gbif.org/v1/species/search?higherTaxonKey='+grandparent.key+'&rank='+taxaKeys[theRank]+'&limit=1000&status=ACCEPTED&isExtinct=false')
	.then(response => response.json())
	.then(incoming =>
	{
		if (incoming.results.length === 0 && theRank+1 < 7)
		{
			fetchGrandchildren(grandparent, theRank+1);
			showInfoTitle(incoming.results.length, grandparent, theRank);
		}
		else
		{
			const children = filterResults(incoming.results);
			if (children.length === 0)
			{
				spacesForSuggestions[theRank].append(suggestionTitle("There are no children within the "+grandparent.rank.slice(0,1)+grandparent.rank.slice(1).toLowerCase()+" "+(grandparent.canonicalName !== undefined) ? grandparent.canonicalName : grandparent.scientificName));
				return;
			}
			showInfoTitle(children.length, grandparent, theRank);
			makeChildren(children, theRank);
		}
	});
}

function makeChildren(children, theRank)
{
	let colorDegree = randomInt(0,360);
	const previousClick = {element: null, backgroundColor: null}
	let multiplicator = 1;
	const childrenDivs = [];
	for (const child in children)
	{
		colorDegree += 4;
		const aChild = createSuggestionBlock(colorDegree);
		childrenDivs.push(aChild);
		if (children[child].canonicalName === undefined) aChild.innerHTML = children[child].scientificName; // viruses, bacteria often don't have canonical names; their names may look like generic designations.
		else aChild.innerHTML = children[child].canonicalName;
		spacesForSuggestions[theRank].append(aChild);
		if (child >= showLimit) aChild.style.display = 'none';
		else setTimeout(()=>
		{
			aChild.animate({opacity: [0,1]},300).onfinish = ()=> aChild.style.opacity = 1;
		},20*child);
		aChild.onclick = ()=>
		{
			suggestionBlockClickStyling(aChild, previousClick);
			if (children[child].canonicalName === undefined) findRanks[theRank].value = children[child].scientificName;
			else findRanks[theRank].value = children[child].canonicalName;
			if (children[child].rank !== 'SPECIES')
			{
				for (let space = theRank+1; space < ranks.length; space++) spacesForSuggestions[space].innerHTML = "";
				fetchChildren(children[child], theRank+1);
			}
			getClickedSelection(children[child]);
		}		
	}
	
	let showMore;
	let showAll;
	if (children.length > 50)
	{
		showMore = g();
		showMore.classList.add('showMore', 'brightHover')
		const plus = g();
		plus.innerHTML = '+';
		plus.classList.add('plus');
		const number = g();
		number.innerHTML = showLimit;
		number.classList.add('plus');
		number.style['font-size'] = '30px';
		showMore.append(plus, number)
		spacesForSuggestions[theRank].append(showMore);
		showMore.onclick = ()=> showMoreChildren(false);
		
		showAll = g();
		showAll.innerHTML = 'Show All';
		showAll.classList.add('plus', 'brightHover');
		showAll.style['font-size'] = '30px';
		showAll.style.color = 'deepskyblue';
		showAll.style.margin = '0px';
		showAll.style['margin-left'] = '40px';
		spacesForSuggestions[theRank].append(showAll);
		showAll.onclick = ()=> showMoreChildren(true);
	}

	function showMoreChildren(all)
	{
		multiplicator++;
		const end = (all) ? childrenDivs.length : (multiplicator*showLimit > childrenDivs.length) ? childrenDivs.length : multiplicator*showLimit;
		const start = (multiplicator-1)*showLimit;
		if (end === childrenDivs.length)
		{
			showAll.remove();
			showMore.remove();
		}
		for (let child = start; child < end; child++)
		{
			childrenDivs[child].style.display = 'block';
			setTimeout(()=>
			{
				childrenDivs[child].animate({opacity: [0,1]},300).onfinish = ()=> childrenDivs[child].style.opacity = 1;
			},20* ((end-start <= 50) ? (child-(multiplicator-1)*showLimit) : (1/20)));
		}
	}
}

function filterResults(results)
{
	const selection = [];
	for (const result of results)
	{
		if (((result.status !== 'ACCEPTED' && result.taxonomicStatus === undefined) || (result.status === undefined && result.taxonomicStatus !== 'ACCEPTED')) || result.synonym === true || (result.scientificName === undefined && result.canonicalName === undefined) || result.rank === 'UNRANKED') continue;
		selection.push(result);
	}
	return selection;
}

function showInfoTitle(childrenLen, parent, theRank, unranked)
{
	const generations = theRank - taxaKeys.indexOf(parent.rank.toLowerCase());
	spacesForSuggestions[theRank].append(suggestionTitle("There "+ ((childrenLen === 1) ? "is" : "are") + " " + ((childrenLen > 0) ? childrenLen : "no") + " " + ((unranked === 'UNRANKED') ? 'Unranked' : ((childrenLen === 1) ? taxaKeys[theRank].slice(0,1).toUpperCase() + taxaKeys[theRank].slice(1) : ((theRank === 1) ? 'Phyla' : (theRank === 2) ? 'Classes' : (theRank === 3) ? 'Order' : (theRank === 4) ? 'Families' : (theRank === 5) ? 'Genera' : 'Species'))) +" within the "+taxaKeys[theRank-generations].slice(0,1).toUpperCase()+taxaKeys[theRank-generations].slice(1)+ " <i>" +((parent.canonicalName !== undefined) ? parent.canonicalName : parent.scientificName)+"</i>"));
}

function suggestionTitle(title)
{
	const newGroup = g();
	newGroup.classList.add('flexPart', 'newGroup');
	const line1 = g();
	line1.style['border-color'] = '#2A4051';
	line1.style.margin = '10px';
	line1.style['border-width'] = '3px';
	line1.classList.add('horizontalLine');
	const groupTitle = g();
	groupTitle.classList.add('groupTitle');
	groupTitle.style.color = '#2A4051';
	groupTitle.style['font-size'] = '14';
	groupTitle.style['letter-spacing'] = '0em';
	groupTitle.innerHTML = title;
	newGroup.append(line1, groupTitle, line1.cloneNode(true));
	return newGroup;
}

// CREDITS: https://www.30secondsofcode.org/js/s/rgb-to-hsl/
// https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
function RGBToHSL(r, g, b)
{
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

function getClickedSelection(selection)
{
	console.log(selection);
	if (newSpeciesSpace.style.display === 'block')
	{
		if (selection.rank === 'SPECIES') return;
		parentSelection.value = (selection.canonicalName !== undefined) ? selection.canonicalName : selection.scientificName;
		parentSelectionChange();
	}
	else if (newOccurrenceSpace.style.display === 'block')
	{
		if (selection.rank !== 'SPECIES') return;
		speciesSelection.value = (selection.canonicalName !== undefined) ? selection.canonicalName : selection.scientificName;
		speciesSelectionChange();
	}
	else inputSearch.value = selection.key;
	return selection;
}

export {taxaNavigator, filterResults, suggestionTitle, createSuggestionBlock, suggestionBlockClickStyling};