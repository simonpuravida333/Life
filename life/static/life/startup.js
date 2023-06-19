import search from './search.js';
import {fullWindow, goLeft, goRight} from './fullWindowImage.js';
import {fadeOut, fadeTime} from './animation.js';
import {selectRank} from './filter.js';

const body = document.querySelector('body');
body.style['background-color'] = '#325D77' //'#3C7185';

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

// GLOBAL TAXA NAMES
const taxaKeys = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];
const ranks = [0,1,2,3,4,5,6]; // allows me to use for-of loops in JS as if it were for-ins in Python. Meaning: I don't have to describe silly for(intialize, condition, afterthought) every time I loop through taxaKeys or taxaBlocks (create.js) and need the indeces.

// SEARCH SECTION
const searchSection = document.createElement('div');
const textareaNameSearch = document.createElement('input');
const rankCondition = document.createElement('select');
const searchGo = document.createElement('button');
const howTo = document.createElement('div');
const howToText = document.createElement('div');

for (const key of taxaKeys)
{
	let opt = document.createElement('option');
	opt.value = key;
	opt.innerHTML = key.toUpperCase();
	if(key == 'species') opt.selected=true;
	rankCondition.append(opt);
}
const seperation = document.createElement('option');
seperation.value = 'seperation';
seperation.innerHTML = '--------';
const any = document.createElement('option');
any.value = 'any';
any.innerHTML = 'ANY';
const highestRank = document.createElement('option');
highestRank.value = 'highestRank';
highestRank.innerHTML = 'HIGHEST RANK';
const allRanks = document.createElement('option');
allRanks.value = 'allRanks';
allRanks.innerHTML = 'ALL RANKS';
const seperation2 = document.createElement('option');
seperation2.value = 'seperation';
seperation2.innerHTML = '--------';
const canonicalName = document.createElement('option');
canonicalName.value = 'canonicalName';
canonicalName.innerHTML= 'CANONICAL NAME';

rankCondition.append(seperation, any, highestRank, allRanks, seperation2, canonicalName);

searchSection.id = 'searchSection';
textareaNameSearch.id = 'textareaNameSearch';
rankCondition.classList.add('select');
searchGo.id = 'searchGo';
howTo.id = 'howTo';
howToText.id = 'howToText';

searchGo.innerHTML = 'GO'
howTo.innerHTML = "?";
howToText.innerHTML = "● This app allows you to search the <strong><i>GLOBAL BIODIVERSITY INFORMATION FACILITY (GBIF)</strong></i><br>● You can query using vernacular / folk names.<br><br><i>FYI:</i><br>When using vernacular names, sometimes there can be confusion due to the nature of vernacular or folk names.<br>E.g. searching for SPECIES 'whale' will yield 58 species of whale where 'whale' is part of the name, like southern right whale, bowhead whale and whaleshark, even though the latter is a shark. But if you searched for SPECIES 'dolphin' you'll be given 48 species that would not appear within the finds for 'whale'. Scientifically, dolphins are whales, but in their own FAMILY rank, beneath the ORDER rank Cetacea (whales); for the same reason killer whales would be missing in the 'dolphin' results, even though Orcas belong to the FAMILY of dolphins. Likewise, searching for 'whale' in the FAMILY rank would yield ten families of whales where the dolphin family would be missing as well.";
howToText.style.display = 'none';
howTo.addEventListener('click', ()=>
{
	if (howToText.style.display === 'none') howToText.style.display = 'block';
	else howToText.style.display = 'none';
});

searchSection.append(textareaNameSearch, rankCondition, searchGo, howTo, howToText);
body.append(searchSection);

textareaNameSearch.addEventListener('mouseover',()=>{if (textareaNameSearch !== document.activeElement) textareaNameSearch.animate([{backgroundColor: '#409CB5' },{backgroundColor: '#8FE2FF' }],fadeTime)});
textareaNameSearch.addEventListener('mouseout',()=>{if (textareaNameSearch !== document.activeElement) textareaNameSearch.animate([{backgroundColor: '#8FE2FF' },{backgroundColor: '#409CB5' }],fadeTime)});
rankCondition.addEventListener('mouseover',()=>{if (rankCondition !== document.activeElement) rankCondition.animate([{backgroundColor: '#409CB5' },{backgroundColor: '#8FE2FF' }],fadeTime)});
rankCondition.addEventListener('mouseout',()=>{if (rankCondition !== document.activeElement) rankCondition.animate([{backgroundColor: '#8FE2FF' },{backgroundColor: '#409CB5' }],fadeTime)});
searchGo.addEventListener('mouseover', ()=> {if (searchGo !== document.activeElement) searchGo.animate([{backgroundColor: '#2BAF60'},{backgroundColor: '#8AED97'}],fadeTime)});
searchGo.addEventListener('mouseout', ()=> {if (searchGo !== document.activeElement) searchGo.animate([{backgroundColor: '#8AED97'},{backgroundColor: '#2BAF60'}],fadeTime)});
// END SEARCH SECTION

// RESULT OVERVIEW SECTION
const resultOverview = document.createElement('div');
resultOverview.classList.add('blockRow', 'flexPart');
// resultOverview.style.display = 'none';
resultOverview.style.opacity = 0;
body.append(resultOverview);
// END RESULT OVERVIEW SECTION

// FILTER AREA
const filterArea = document.createElement('div');
filterArea.classList.add('blockRow', 'flexPart');
// filterArea.style.display = 'none';
filterArea.style.opacity = 0;
body.append(filterArea);
const allRankFilters = [];

for (const rank of taxaKeys)
{
	const container = document.createElement('div');
	const selectTitle = document.createElement('div');
	selectTitle.innerHTML = rank.toUpperCase();
	selectTitle.classList.add('selectTitle');
	const rankFilter = document.createElement('select');
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
		rankCondition.style['width'] = '200px';
	}
	else if (rankCondition.value === 'allRanks')
	{
		rankCondition.style['width'] = '160px';
	}
	else if (rankCondition.value === 'canonicalName')
	{
		rankCondition.style['width'] = '240px';
	}
	else rankCondition.style['width'] = '140px';
});

searchGo.addEventListener('click',()=>
{
	if (textareaNameSearch.value.trim() !== "")
	{
		search(textareaNameSearch.value.trim(), rankCondition.value);
		textareaNameSearch.value="";
	}
});

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
search('bird of paradise','species');
//search('loboparadisea sericea','canonicalName'); // closed when still fetching initial images
//search('semioptera wallacii','canonicalName');
//search('Paradisaea decora','canonicalName');
//search('whale','family');

export {taxaKeys, ranks, resultOverview, filterArea, allRankFilters};

// modules work like curly braces, so declaring variables keeps them confined to the scope of a module. Exported variables are read only, meaning exported 'var' and 'let' are (basically or actually) 'const' in other modules. To have global cross-module variables, declaring with window.aVariable = 'value' is a solution, as is self.aVariable and globalThis.aVariable, all of which create the same kind of app-wide prototype object. Putting them in Object.prototype.toString.call() will give [Object Window] for each of the three. This would be true: globalThis === self && self === window;
// Another solution is to export a function that allows to manipulate module-wide variables of another module, though this is less recommended.
// For this app I solved it by simply exporting JS objects, rather than primitive types variables.