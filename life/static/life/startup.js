import './globalVariables.js';
import {spaceForNature, parentSquares, blossom, howToSpace} from './graphics.js';
import search from './search.js';
import {fullWindow, goLeft, goRight} from './fullWindowImage.js';
import {fadeOut, fadeTime} from './animation.js';
import {selectRank} from './filter.js';
import {taxaNavigator} from './taxonomyFinder.js';
import {newSpeciesSpace, closeNewSpeciesSpace} from './newSpecies.js';
import {newOccurrenceSpace, closeNewOccurrence} from './newOccurrence.js';
import touchResponse from './swipe.js'

const body = document.querySelector('body');

let isWebKit = navigator.userAgent.indexOf('AppleWebKit') !== -1;
console.log ("Runs on WebKit / Blink: "+isWebKit);
if (!isWebKit) window.alert("Dear user,\nSome of the styling of Life is only supported in browsers that run on WebKit / Blink.\n(Safari, Google Chrome, Microsoft Edge, Opera...)"); // ...nested CSS description that is.

//console.log(document.styleSheets)
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
	if (key === enterKey && inputSearch.value.trim() !== "" && (inputSearch === document.activeElement || rankCondition === document.activeElement))
	{
		search(inputSearch.value.trim(), rankCondition.value);
		search(inputSearch.value.trim(), rankCondition.value, true);
		inputSearch.value="";
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
const inputSearch = g('in');
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

searchSection.classList.add('blockRow', 'flexPart');
searchSection.style['z-index'] = 2;
searchSection.style.position = 'relative';
inputSearch.classList.add('interactionField', 'inputSearch');
if (isMobile) inputSearch.style.width = '100%';
rankCondition.classList.add('interactionField', 'rankSelect');
withinSearch.id = 'withinSearch';
withinSearchCore.id = 'withinSearchCore';
searchGo.classList.add('searchGo', 'go');
findTaxonomy.classList.add('searchGo', 'locate');
newSpecies.classList.add('searchGo', 'newSpecies');
newOccurrence.classList.add('searchGo', 'newOccurrence');
howTo.id = 'howTo';
searchGo.innerHTML = 'GO'
findTaxonomy.innerHTML = 'LOCATE';
newSpecies.innerHTML = 'NEW SPECIES';
newOccurrence.innerHTML = 'NEW OCCURRENCE';
howTo.innerHTML = "?";
//howTo.addEventListener('click', ()=>

withinSearch.append(withinSearchCore);
searchSection.append(inputSearch, rankCondition, withinSearch/*, searchGo, findTaxonomy, newSpecies, newOccurrence, howTo*/); // purpose of commented-out buttons replaced with elements from graphics.js (parentSquares[] elements and blossom element). All the original buttons are left throughout this module; only their activation (append and attached functions) is commented-out; in case of quick re-activation being desired.
body.append(howToSpace, spaceForNature, searchSection);

inputSearch.addEventListener('mouseover',()=>
{
	if (inputSearch !== document.activeElement) 
	{
		if (!withinSearchActivated) inputSearch.animate([{backgroundColor: '#4C9590' },{backgroundColor: '#8FE2FF' }],fadeTime);
		else inputSearch.animate({backgroundColor: ['orange','white']},fadeTime);
	}
});
inputSearch.addEventListener('mouseout',()=>
{
	if (inputSearch !== document.activeElement)
	{
		if (!withinSearchActivated) inputSearch.animate([{backgroundColor: '#8FE2FF' },{backgroundColor: '#4C9590' }],fadeTime);
		else inputSearch.animate({backgroundColor: ['white','orange']},fadeTime);
	}
});
rankCondition.addEventListener('mouseover',()=>
{
	if (rankCondition !== document.activeElement)
	{
		if (!withinSearchActivated) rankCondition.animate({backgroundColor:[ '#4C9590','#8FE2FF']},fadeTime);
		else rankCondition.animate({backgroundColor: ['orange','white']},fadeTime);
	}
});
rankCondition.addEventListener('mouseout',()=>
{
	if (rankCondition !== document.activeElement)
	{
		if (!withinSearchActivated) rankCondition.animate({backgroundColor:[ '#8FE2FF','#4C9590']},fadeTime);
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
	if (!withinSearchActivated) withinSearch.animate({borderColor: ['#4C9590','orange']},fadeTime).onfinish = ()=> withinSearch.style['border-color'] = 'orange';
});
withinSearch.addEventListener('mouseout', ()=>
{ 
	if (!withinSearchActivated) withinSearch.animate({borderColor: ['orange','#4C9590']},fadeTime).onfinish = ()=> withinSearch.style['border-color'] = '#4C9590';
});
withinSearch.addEventListener('click', ()=>
{
	withinSearchActivated ^= true;
	
	if (withinSearchActivated)
	{
		limitOptions(true);
		withinSearchCore.style.display = 'block';
		withinSearchCore.animate({opacity: [0,1], width: ['0px','22px'],height: ['0px','22px'], margin: ['18px','5px']},fadeTime/2);
		rankCondition.classList.add('withinRankSelect');
		inputSearch.classList.add('inputWithinSearch');
		withinSearch.style['border-color'] = 'orange';
		rankCondition.style.width = '280px';
		rankCondition.animate({opacity: [1,0]},333).onfinish = ()=> rankCondition.animate({opacity: [0,1]},333);
		inputSearch.animate({opacity: [1,0]},333).onfinish = ()=> {inputSearch.animate({opacity: [0,1]},333); searchSection.insertBefore(rankCondition, inputSearch)}
	}
	else
	{
		limitOptions(false);
		withinSearchCore.animate({opacity: [1,0],width: ['22px','0px'],height:['22px','0px'], margin: ['5px','18px']},fadeTime/2).onfinish=()=> withinSearchCore.style.display = 'none';
		rankCondition.classList.remove('withinRankSelect');
		inputSearch.classList.remove('inputWithinSearch');
		withinSearch.style['border-color'] = '#4C9590';
		rankCondition.style.width = '140px';
		rankCondition.animate({opacity: [1,0]},333).onfinish = ()=> rankCondition.animate({opacity: [0,1]},333);
		inputSearch.animate({opacity: [1,0]},333).onfinish = ()=> {inputSearch.animate({opacity: [0,1]},333); searchSection.insertBefore(inputSearch, rankCondition)}
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
	rankFilter.classList.add('filter');
	rankFilter.addEventListener('change', ()=> selectRank(taxaKeys.indexOf(rank)));
	allRankFilters.push(rankFilter);
	container.append(selectTitle, rankFilter);
	filterArea.append(container);
	/*
	rankFilter.addEventListener('mouseover', ()=>{if (rankFilter !== document.activeElement) rankFilter.animate([{backgroundColor: '#2BAF60' },{backgroundColor: '#8AED97' }],fadeTime)});
	rankFilter.addEventListener('mouseout', ()=>{if (rankFilter !== document.activeElement) rankFilter.animate([{backgroundColor: '#8AED97' },{backgroundColor: '#2BAF60' }],fadeTime)});
	*/
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

//searchGo.onclick = ()=>
parentSquares[0].onclick = ()=>
{
	if (inputSearch.value.trim() !== "")
	{
		search(inputSearch.value.trim(), rankCondition.value);
		search(inputSearch.value.trim(), rankCondition.value, true);
		inputSearch.value="";
	}
}

//findTaxonomy.onclick = ()=>
parentSquares[1].onclick = ()=>
{
	if (taxaNavigator.style.display === 'none')
	{
		searchSection.after(taxaNavigator);
		taxaNavigator.style.display = 'block';
		taxaNavigator.animate({opacity: [0,1]},500);
		findTaxonomy.style['background-color'] = '#8AED97';
		touchResponse(taxaNavigator);
	}
	else
	{
		taxaNavigator.animate({opacity: [1,0]},500).onfinish = ()=> taxaNavigator.style.display = 'none';
		findTaxonomy.style['background-color'] = null;
	}
}

searchSection.after(newSpeciesSpace);
searchSection.after(newOccurrenceSpace);

//newSpecies.onclick = ()=>
parentSquares[2].onclick = ()=> openNewSpeciesOccurrence(newSpeciesSpace, newSpecies);
//newOccurrence.onclick = ()=>
parentSquares[3].onclick = ()=> openNewSpeciesOccurrence(newOccurrenceSpace, newOccurrence);
if (!isMobile)
{
	closeNewSpeciesSpace.onclick = ()=> closeNewSpeciesOccurrence(newSpeciesSpace);
	closeNewOccurrence.onclick = ()=> closeNewSpeciesOccurrence(newOccurrenceSpace);
}

function closeNewSpeciesOccurrence(space) // new species OR new occurrence
{
	if (taxaNavigator.style.display === 'block') parentSquares[1].click(); //findTaxonomy.click();
	space.style.display = 'none';
	searchSection.style.display = 'flex';
	searchSection.animate({opacity: [0,1]},500);
	spaceForNature.style.display = 'flex';
	spaceForNature.animate({opacity: [0,1]},500);
	for (const e of Array.from(document.getElementsByClassName('findRank'))) e.style = null;
	for (const e of Array.from(document.getElementsByClassName('newSpeciesLabel'))) e.style = null;
}

function openNewSpeciesOccurrence(space) // new species OR new occurrence
{
	if (taxaNavigator.style.display === 'block') parentSquares[1].click(); //findTaxonomy.click();
	space.style.display = 'block';
	space.animate({opacity: [0,1]},500);
	if (isMobile) touchResponse(space, closeNewSpeciesOccurrence);
	searchSection.style.display = 'none';
	spaceForNature.style.display = 'none';
	const inputFields = Array.from(document.getElementsByClassName('findRank'));
	const fieldLabels = Array.from(document.getElementsByClassName('newSpeciesLabel'));
	for (const field of inputFields)
	{
		field.style['background-color'] = '#2BAF60';
		field.style.color = 'white';
	}
	if (inputFields.length > 0) for (const x in ranks) fieldLabels[x].style.color = '#2BAF60'; 
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
//search('blueberry','species');
//search('emu', 'species');
//search('takahe', 'species');

// +++ within search +++
//withinSearchActivated = true;
//search('Psittaciformes', 'species');
//search('Paradisaeidae', 'species');

export {searchSection, inputSearch, resultOverview, filterArea, allRankFilters, withinSearchActivated, closeNewSpeciesOccurrence};

// modules work like curly braces, so declaring variables keeps them confined to the scope of a module. Exported variables are read only, meaning exported 'var' and 'let' are (basically or actually) 'const' in other modules. To have global cross-module variables, declaring with window.aVariable = 'value' is a solution, as is self.aVariable and globalThis.aVariable, all of which make the object global. Putting them in Object.prototype.toString.call() will give [Object Window] for each of the three. This would be true: globalThis === self && self === window. BUT: globalThis is the standard meanwhile, the only one that will work in all kinds of environments from browsers to Node.js and more.
// Another solution is to export a function that allows to manipulate module-wide variables in another module, though this is less recommended.
// For this app I solved it (cross-module variables) mostly by simply exporting JS objects, rather than primitive types variables.