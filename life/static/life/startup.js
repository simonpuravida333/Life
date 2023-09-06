import './globalVariables.js';
import search from './search.js';
import {fullWindow, goLeft, goRight} from './fullWindowImage.js';
import {fadeOut, fadeTime} from './animation.js';
import {selectRank} from './filter.js';
import {findSpace} from './taxonomyFinder.js';
import {newSpeciesSpace, closeNewSpeciesSpace} from './newSpecies.js';
import {newOccurrenceSpace, closeNewOccurrence} from './newOccurrence.js';
import touchResponse from './swipe.js'

const body = document.querySelector('body');
body.style['background-color'] = '#325D77' //'#3C7185';

let isWebKit = navigator.userAgent.indexOf('AppleWebKit') !== -1;
console.log ("Runs on WebKit / Blink: "+isWebKit);
if (!isWebKit) window.alert("Dear user,\nSome of the styling of Life is only supported in browsers that run on WebKit / Blink.\n(Safari, Google Chrome, Microsoft Edge, Opera...)"); // ...nested CSS description that is.

console.log(document.styleSheets)
for (const sheet of document.styleSheets)
{
	if (sheet.href === null) continue; // for Opera.
	if (sheet.href.indexOf('mobile.css') !== -1 && !isMobile) sheet.disabled = true;
	else if (sheet.href.indexOf('desktop.css') !== -1 && isMobile) sheet.disabled = true;
} // styles.css is the standard file that has all descriptions that APPLY FOR BOTH, desktop and mobile. Every other styling (which varies between desktop and mobile) is handled in the two files. desktop.css and mobile.css use the same class and ID names, so all it takes is to swap out the files.

if (isMobile) adjustZoom();
function adjustZoom()
{
	if (window.innerHeight > window.innerWidth) body.style.zoom = 2;
	else body.style.zoom = 1.2;
}
if (isMobile) window.addEventListener('resize', adjustZoom); // when tilting smartphone

window.addEventListener('keydown', (event)=>
{
	let key = event.keyCode || event.which;
	const enterKey = 13;
	const arrowUp = 38;
	const arrowDown = 40;
		
	// SEARCH ELEMENT
	if (key === enterKey && textareaNameSearch.value.trim() !== "" && (textareaNameSearch === document.activeElement || rankCondition === document.activeElement))
	{
		search(textareaNameSearch.value.trim(), rankCondition.value);
		search(textareaNameSearch.value.trim(), rankCondition.value, true);
		textareaNameSearch.value="";
	}
	if (key === arrowDown && rankCondition.value === 'species')
	{
		setTimeout(()=> {rankCondition.value = 'any'},	10);
	}
	if (key === arrowUp && rankCondition.value === 'any')
	{
		setTimeout(()=> {rankCondition.value = 'species'},	10);
	}
	if (key === arrowDown && rankCondition.value === 'allRanks')
	{
		setTimeout(()=> {rankCondition.value = 'canonicalName'; rankCondition.style['width'] = '240px';}, 10); // despite having a change-listener, when using the keyboard, the width doesn't adjust in these two cases, but works for 'highest rank' (??).
	}
	if (key === arrowUp && rankCondition.value === 'canonicalName')
	{
		setTimeout(()=> {rankCondition.value = 'allRanks'; rankCondition.style['width'] = '160px';}, 10);
	}
});

// SEARCH SECTION
const searchSection = g();
const textareaNameSearch = g('in');
const rankCondition = g('s');
const withinSearch = g();
const withinSearchCore = g();
const searchGo = g('b');
const findTaxonomy = g('b');
const newSpecies = g('b');
const newOccurrence = g('b');
const howTo = g();
const howToText = g();
let withinSearchActivated = false;

for (const key of taxaKeys)
{
	let opt = g('o');
	opt.value = key;
	opt.innerHTML = key.toUpperCase();
	if(key == 'species') opt.selected=true;
	rankCondition.append(opt);
}
const seperation = g('o');
seperation.value = 'seperation';
seperation.innerHTML = '--------';
const any = g('o');
any.value = 'any';
any.innerHTML = 'ANY';
const highestRank = g('o');
highestRank.value = 'highestRank';
highestRank.innerHTML = 'HIGHEST RANK';
const allRanks = g('o');
allRanks.value = 'allRanks';
allRanks.innerHTML = 'ALL RANKS';
const seperation2 = g('o');
seperation2.value = 'seperation';
seperation2.innerHTML = '--------';
const canonicalName = g('o');
canonicalName.value = 'canonicalName';
canonicalName.innerHTML= 'CANONICAL NAME';

rankCondition.append(seperation, any, highestRank, allRanks, seperation2, canonicalName)

searchSection.id = 'searchSection';
textareaNameSearch.id = 'textareaNameSearch';
rankCondition.classList.add('select');
withinSearch.id = 'withinSearch';
withinSearchCore.id = 'withinSearchCore';
searchGo.classList.add('searchGo', 'go');
findTaxonomy.classList.add('searchGo', 'locate');
newSpecies.classList.add('searchGo', 'newSpecies');
newOccurrence.classList.add('searchGo', 'newOccurrence');
howTo.id = 'howTo';
howToText.id = 'howToText';
searchGo.innerHTML = 'GO'
findTaxonomy.innerHTML = 'LOCATE';
newSpecies.innerHTML = 'NEW SPECIES';
newOccurrence.innerHTML = 'NEW OCCURRENCE';
howTo.innerHTML = "?";
howToText.innerHTML = "This app allows you to search the<br><strong><i>GLOBAL BIODIVERSITY INFORMATION FACILITY (GBIF).</strong></i><br><br>You can query the GBIF using vernacular names.<br>Choose a rank for which you want to find results.<br><br>If you want to search for canonical names, you have to set it rank selector to CANONICAL NAME.<br><br>Activate the trigger right of the rank selector to <strong><i>query for every taxa of a rank within higher taxa rank</i></strong> (query areas turn orange):<br>You'll have to use canonical names for acurate <i>(e.g.) every SPECIES within</i> results, as the GBIF needs to know the exact taxa in which it can search.<br>For example querying for 'Paradisaeidae' (FAMILY of birds of paradise) and having chosen the rank '<i>every SPECIES within</i>' will yield <i>all SPECIES within the FAMILY rank 'Paradisaeidae'</i>.<br><br>After having queried for something, beneath the query-area will appear a <i><strong>result summery area.</i></strong> New queries won't reset the content, they'll be added, and you can use the summery-area to click on a summery to make the window teleport to the result. Holding mouse on a result summery until it turns orange will delete it.<br><br>Beneath comes the <i><strong>filter area</i></strong> which can help you navigate and narrow down results. E.g. querying for the SPECIES 'strawberry' will yield 87 results, 39 of which are animals (surprised? They're strawberry-coloured or -shaped insects, anemoa, cockles, sea squirts, fish, frogs, crabs...). Just setting the KINGDOM filter to 'Plantae', you can halve the results. This does not remove the animal results, it just hides them. Setting KINGDOM to '...' will let everything show up again, because '...' (idle filter) will set any lower rank filter to '...' as well. Next to how many results there are for any taxa, filters also show (when opening) which of the taxa are contained within the taxa selected in an upper rank filter: contained taxa are <strong style='color:orange'>bold orange</strong>. This is very useful to get a connected understanding of your results. Filters always keep every taxa from every result, even if the result is not displayed right now from a set filter. This allows you to directly change the setting of the filter. Setting any filter will always pre-fill the higher filters with the ancestor lineage, and the lower filters with '...' to allow everything from this rank onwards (downwards) to be displayed.<br><br>After filter come the actual results, always <i><strong>grouped by the title</i></strong> (your query). Clicking on the title will hide / show the entire group / query results. This may be of use when making multiple queries (having multiple groups). Groups and the upper mentioned <i>result summeries</i> are the same; delete groups in the result summery area.<br><br><i><strong>A note on using vernacular names for queries:</strong></i><br>Sometimes the nature of vernacular or folk names can be confusing.<br>E.g. searching for SPECIES 'whale' will yield 58 species of whale where 'whale' is part of the name, like southern right whale, bowhead whale and whaleshark, even though the latter is a shark. But if you searched for SPECIES 'dolphin' you'll be given 48 species that would not appear within the finds for 'whale'. Scientifically, dolphins are whales, but in their own FAMILY rank, beneath the ORDER rank Cetacea (whales); for the same reason killer whales would be missing in the 'dolphin' results, even though Orcas belong to the FAMILY of dolphins. Likewise, searching for 'whale' in the FAMILY rank would yield ten families of whales where the dolphin family would be missing as well.";
	// If you would search for 'Paradisaeidae' in the CANONICAL NAME category, you'd receive the single family object. Searching for 'bird of paradise' in the default SPECIES (vernacular name) category would give you 8 plants and 18 animals, of which 2 aren't birds of paradise. These are the results where 'bird of paradise' appears in the vernacular name. But using the canonical name in the <i>every SPECIES within</i> option would give you 56 birds of paradise (so, all birds of paradise known to exist).
howToText.style.display = 'none';
howTo.addEventListener('click', ()=>
{
	if (howToText.style.display === 'none') howToText.style.display = 'block';
	else howToText.style.display = 'none';
});

withinSearch.append(withinSearchCore);
searchSection.append(textareaNameSearch, rankCondition, withinSearch , searchGo, findTaxonomy, newSpecies, newOccurrence, howTo, howToText);
body.append(searchSection);

textareaNameSearch.addEventListener('mouseover',()=>
{
	if (textareaNameSearch !== document.activeElement) 
	{
		if (!withinSearchActivated) textareaNameSearch.animate([{backgroundColor: '#409CB5' },{backgroundColor: '#8FE2FF' }],fadeTime);
		else textareaNameSearch.animate({backgroundColor: ['orange','white']},fadeTime);
	}
});
textareaNameSearch.addEventListener('mouseout',()=>
{
	if (textareaNameSearch !== document.activeElement)
	{
		if (!withinSearchActivated) textareaNameSearch.animate([{backgroundColor: '#8FE2FF' },{backgroundColor: '#409CB5' }],fadeTime);
		else textareaNameSearch.animate({backgroundColor: ['white','orange']},fadeTime);
	}
});
rankCondition.addEventListener('mouseover',()=>
{
	if (rankCondition !== document.activeElement)
	{
		if (!withinSearchActivated) rankCondition.animate({backgroundColor:[ '#409CB5','#8FE2FF']},fadeTime);
		else rankCondition.animate({backgroundColor: ['orange','white']},fadeTime);
	}
});
rankCondition.addEventListener('mouseout',()=>
{
	if (rankCondition !== document.activeElement)
	{
		if (!withinSearchActivated) rankCondition.animate({backgroundColor:[ '#8FE2FF','#409CB5']},fadeTime);
		else rankCondition.animate({backgroundColor: ['white','orange']},fadeTime);
	}
});
searchGo.addEventListener('mouseover', ()=> {if (searchGo !== document.activeElement) searchGo.animate([{backgroundColor: '#2BAF60'},{backgroundColor: '#8AED97'}],fadeTime)});
searchGo.addEventListener('mouseout', ()=> {if (searchGo !== document.activeElement) searchGo.animate([{backgroundColor: '#8AED97'},{backgroundColor: '#2BAF60'}],fadeTime)});
findTaxonomy.addEventListener('mouseover', ()=> {if (findTaxonomy !== document.activeElement) findTaxonomy.animate([{backgroundColor: '#2BAF60'},{backgroundColor: '#8AED97'}],fadeTime)});
findTaxonomy.addEventListener('mouseout', ()=> {if (findTaxonomy !== document.activeElement) findTaxonomy.animate([{backgroundColor: '#8AED97'},{backgroundColor: '#2BAF60'}],fadeTime)});
newSpecies.addEventListener('mouseover', ()=> newSpecies.animate([{backgroundColor: 'orange'},{backgroundColor: '#ffe164'}],fadeTime).onfinish = ()=>{newSpecies.style['background-color'] = '#ffe164';});
newSpecies.addEventListener('mouseout', ()=> newSpecies.animate([{backgroundColor: '#ffe164'},{backgroundColor: 'orange'}],fadeTime).onfinish = ()=>{newSpecies.style['background-color'] = null;});
newOccurrence.addEventListener('mouseover', ()=> newOccurrence.animate([{backgroundColor: 'orange'},{backgroundColor: '#ffe164'}],fadeTime).onfinish = ()=>{newOccurrence.style['background-color'] = '#ffe164';});
newOccurrence.addEventListener('mouseout', ()=> newOccurrence.animate([{backgroundColor: '#ffe164'},{backgroundColor: 'orange'}],fadeTime).onfinish = ()=>{newOccurrence.style['background-color'] = null});

withinSearch.addEventListener('mouseover', ()=>
{ 
	if (!withinSearchActivated) withinSearch.animate({borderColor: ['#409CB5','orange']},fadeTime).onfinish = ()=> withinSearch.style['border-color'] = 'orange';
});
withinSearch.addEventListener('mouseout', ()=>
{ 
	if (!withinSearchActivated) withinSearch.animate({borderColor: ['orange','#409CB5']},fadeTime).onfinish = ()=> withinSearch.style['border-color'] = '#409CB5';
});
withinSearch.addEventListener('click', ()=>
{
	withinSearchActivated ^= true;
	
	if (withinSearchActivated)
	{
		limitOptions(true);
		withinSearchCore.style.display = 'block';
		withinSearchCore.animate({opacity: [0,1], width: ['0px','22px'],height: ['0px','22px'], margin: ['18px','5px']},fadeTime/2);
		rankCondition.classList.add('withinOptions');
		textareaNameSearch.classList.add('textareaWithinSearch');
		withinSearch.style['border-color'] = 'orange';
		rankCondition.style.width = '280px';
		rankCondition.animate({opacity: [1,0]},333).onfinish = ()=> rankCondition.animate({opacity: [0,1]},333);
		textareaNameSearch.animate({opacity: [1,0]},333).onfinish = ()=> {textareaNameSearch.animate({opacity: [0,1]},333); searchSection.insertBefore(rankCondition, textareaNameSearch)}
	}
	else
	{
		limitOptions(false);
		withinSearchCore.animate({opacity: [1,0],width: ['22px','0px'],height:['22px','0px'], margin: ['5px','18px']},fadeTime/2).onfinish=()=> withinSearchCore.style.display = 'none';
		rankCondition.classList.remove('withinOptions');
		textareaNameSearch.classList.remove('textareaWithinSearch');
		withinSearch.style['border-color'] = '#409CB5';
		rankCondition.style.width = '140px';
		rankCondition.animate({opacity: [1,0]},333).onfinish = ()=> rankCondition.animate({opacity: [0,1]},333);
		textareaNameSearch.animate({opacity: [1,0]},333).onfinish = ()=> {textareaNameSearch.animate({opacity: [0,1]},333); searchSection.insertBefore(textareaNameSearch, rankCondition)}
	}
});

function limitOptions(limit)
{
	if (limit) for (const option of rankCondition.options)
	{
		let foundOne = false;
		for (const key of taxaKeys) if (option.value === key && key !== 'kingdom')
		{
			foundOne = true;
			option.innerHTML = "every "+ option.innerHTML+ " within";
		}
		if (!foundOne) option.style.display = 'none';
		let reset = true;
		for (const key of taxaKeys) if (rankCondition.value === key && key !== 'kingdom') reset = false;
		if (reset) rankCondition.value = 'genus';
	}
	else
	{
		for (const option of rankCondition.options)
		{
			option.innerHTML = option.innerHTML.replace('every ','');
			option.innerHTML = option.innerHTML.replace(' within','');
			option.style.display = null;
		}
	}
}
// END SEARCH SECTION

// RESULT OVERVIEW SECTION
const resultOverview = g();
resultOverview.classList.add('blockRow', 'flexPart');
resultOverview.style.display = 'none';
body.append(resultOverview);
// END RESULT OVERVIEW SECTION

// FILTER AREA
const filterArea = g();
filterArea.classList.add('blockRow', 'flexPart');
// filterArea.style.display = 'none';
filterArea.style.display = 'none';
body.append(filterArea);
const allRankFilters = [];

for (const rank of taxaKeys)
{
	const container = g();
	const selectTitle = g();
	selectTitle.innerHTML = rank.toUpperCase();
	selectTitle.classList.add('selectTitle');
	const rankFilter = g('s');
	rankFilter.classList.add('select', 'filter');
	rankFilter.addEventListener('change', ()=> selectRank(taxaKeys.indexOf(rank)));
	allRankFilters.push(rankFilter);
	container.append(selectTitle, rankFilter);
	filterArea.append(container);
	
	rankFilter.addEventListener('mouseover',()=>{if (rankFilter !== document.activeElement) rankFilter.animate([{backgroundColor: '#2BAF60' },{backgroundColor: '#8AED97' }],fadeTime)});
	rankFilter.addEventListener('mouseout',()=>{if (rankFilter !== document.activeElement) rankFilter.animate([{backgroundColor: '#8AED97' },{backgroundColor: '#2BAF60' }],fadeTime)});
}
// END FILTER AREA

searchSection.addEventListener('change', ()=>
{
	if (rankCondition.value === 'seperation')
	{
		rankCondition.value = 'species';
	}
	if (rankCondition.value === 'highestRank')
	{
		rankCondition.style.width = '200px';
	}
	else if (rankCondition.value === 'allRanks')
	{
		rankCondition.style.width = '160px';
	}
	else if (rankCondition.value === 'canonicalName')
	{
		rankCondition.style.width = '240px';
	}
	else if (!withinSearchActivated) rankCondition.style = null;
});

searchGo.addEventListener('click',()=>
{
	if (textareaNameSearch.value.trim() !== "")
	{
		search(textareaNameSearch.value.trim(), rankCondition.value);
		search(textareaNameSearch.value.trim(), rankCondition.value, true);
		textareaNameSearch.value="";
	}
});
findTaxonomy.addEventListener('click', ()=>
{
	if (findSpace.style.display === 'none')
	{
		body.prepend(findSpace);
		findSpace.style.display = 'block';
		findSpace.animate({opacity: [0,1]},500);
		findTaxonomy.style['background-color'] = '#8AED97'
	}
	else
	{
		findSpace.animate({opacity: [1,0]},500).onfinish = ()=> findSpace.style.display = 'none';
		findTaxonomy.style['background-color'] = null;
	}
});

searchSection.after(newSpeciesSpace);
searchSection.after(newOccurrenceSpace);
newSpecies.onclick = ()=> openNewSpeciesOccurrence(newSpeciesSpace, newSpecies);
newOccurrence.onclick = ()=> openNewSpeciesOccurrence(newOccurrenceSpace, newOccurrence);
if (!isMobile)
{
	closeNewSpeciesSpace.onclick = ()=> closeNewSpeciesOccurrence(newSpeciesSpace);
	closeNewOccurrence.onclick = ()=> closeNewSpeciesOccurrence(newOccurrenceSpace);
}

function closeNewSpeciesOccurrence(space) // new species OR new occurrence
{
	if (findSpace.style.display === 'block') findTaxonomy.click();
	space.style.display = 'none';
	searchSection.style.display = 'flex';
	searchSection.animate({opacity: [0,1]},500);
	for (const e of Array.from(document.getElementsByClassName('findRank'))) e.style = null;
	for (const e of Array.from(document.getElementsByClassName('newSpeciesLabel'))) e.style = null;
}

function openNewSpeciesOccurrence(space) // new species OR new occurrence
{
	if (findSpace.style.display === 'block') findTaxonomy.click();
	space.style.display = 'block';
	space.animate({opacity: [0,1]},500);
	if (isMobile) touchResponse(space, closeNewSpeciesOccurrence);
	searchSection.style.display = 'none';
	const inputFields = Array.from(document.getElementsByClassName('findRank'));
	const fieldLabels = Array.from(document.getElementsByClassName('newSpeciesLabel'));
	for (const field of inputFields)
	{
		field.style['background-color'] = '#2BAF60';
		field.style.color = 'white';
	}
	for (const x in ranks) fieldLabels[x].style.color = '#2BAF60'; 
}

// DEBUG //
//search('Caperea marginata','canonicalName');
//search('Balaenoptera acutorostrata', 'canonicalName');
//search('Rhincodon typus','canonicalName');
//search('Mesoplodon carlhubbsi','canonicalName');
//search('Mesoplodon layardii','canonicalName');
//search('whale','species');
//search('dart frog','species');
//search('Mesoplodon traversii', 'canonicalName');
//search('Mesoplodon eueu','canonicalName');
//search('remora australis','canonicalName');
//search('giraffe','species');
//search('kangaroo','species');
//search('Requena kangaroo', 'canonicalName');
//search('Simosthenurus occidentalis','canonicalName');
//search('Themeda triandra','canonicalName');
//search('monitor lizard','species');
//search('black bear','species');
//search('boa constrictor','species');
//search('Brassica oleracea', 'canonicalName');
//search('Heliconia platystachys','canonicalName');
//search(2760726,'species');
//search('bird of paradise','species');
//search('loboparadisea sericea','canonicalName'); // closed when still fetching initial images
//search('semioptera wallacii','canonicalName');
//search('Paradisaea decora','canonicalName');
//search('whale','family');
//search('toucan','species');
//search('macaw','species');
search('blueberry','species');

// +++ within search +++
//withinSearchActivated = true;
//search('Psittaciformes', 'species');
//search('Paradisaeidae', 'species');

export {searchSection, textareaNameSearch, resultOverview, filterArea, allRankFilters, withinSearchActivated, closeNewSpeciesOccurrence};

// modules work like curly braces, so declaring variables keeps them confined to the scope of a module. Exported variables are read only, meaning exported 'var' and 'let' are (basically or actually) 'const' in other modules. To have global cross-module variables, declaring with window.aVariable = 'value' is a solution, as is self.aVariable and globalThis.aVariable, all of which make the object global. Putting them in Object.prototype.toString.call() will give [Object Window] for each of the three. This would be true: globalThis === self && self === window. BUT: globalThis is the standard meanwhile, the only one that will work in all kinds of environments from browsers to Node.js and more.
// Another solution is to export a function that allows to manipulate module-wide variables in another module, though this is less recommended.
// For this app I solved it (cross-module variables) mostly by simply exporting JS objects, rather than primitive types variables.