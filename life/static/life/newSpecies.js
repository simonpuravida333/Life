import {taxaNavigator, filterResults, suggestionTitle, createSuggestionBlock, suggestionBlockClickStyling} from './taxonomyFinder.js';

const body = document.querySelector('body');

// NEW GBIF SPECIES ENTRY
const newSpeciesSpace = g();
newSpeciesSpace.classList.add('blockRow');
newSpeciesSpace.style.display = 'none';
newSpeciesSpace.style['z-index'] = 2;
newSpeciesSpace.style.position = 'relative';
const centerDiv = g();
const closeNewSpeciesSpace = g();
const newSpeciesSpaceTitle = g();
newSpeciesSpaceTitle.classList.add('newSpeciesTitle');
newSpeciesSpaceTitle.innerHTML = 'Add a new Species'.toUpperCase();
if (!isMobile)
{
	centerDiv.classList.add('flexPart', 'center');
	const line1 = g();
	line1.style['border-color'] = 'deepskyblue';
	line1.style['border-width'] = '3px';
	line1.classList.add('horizontalLine');
	const line2 = line1.cloneNode(true);
	line1.style['margin-left'] = '60px'; // balancing on the left the close symbol on the right which horizontally takes 60px;
	closeNewSpeciesSpace.innerHTML = '⊙';
	closeNewSpeciesSpace.classList.add('closeNewSpeciesSpace');
	closeNewSpeciesSpace.onmouseover = ()=> closeNewSpeciesSpace.innerHTML = '⦿';
	closeNewSpeciesSpace.onmouseout = ()=> closeNewSpeciesSpace.innerHTML = '⊙';
	centerDiv.append(line1, newSpeciesSpaceTitle, line2, closeNewSpeciesSpace);
}
else 
{
	centerDiv.style['text-align'] = 'center';
	centerDiv.append(newSpeciesSpaceTitle);
}
newSpeciesSpace.append(centerDiv);

const groupOfTwo = new Array(3);
const divisions = new Array(6);
const titles = new Array(6);

for (let x = 0; x < 6; x++)
{
	if (x%2 === 0) groupOfTwo[Math.floor(x/2)] = g();
	titles[x] = g();
	titles[x].classList.add('selectTitle', 'newSpeciesLabel');
	divisions[x] = g();
	divisions[x].append(titles[x]);
	groupOfTwo[Math.floor(x/2)].append(divisions[x]);
	if (x%2 === 0)
	{
		groupOfTwo[Math.floor(x/2)].classList.add('flexPart');
		groupOfTwo[Math.floor(x/2)].style['align-items'] = "center";
		groupOfTwo[Math.floor(x/2)].style['justify-content'] = "center";
		newSpeciesSpace.append(groupOfTwo[Math.floor(x/2)]);
	}
}

// NAMING
const canonicalName = g('in');
canonicalName.classList.add('input', 'newSpeciesInput');
canonicalName.placeholder = 'Delphinus Delphis';
titles[0].innerHTML = 'Canonical Name';
divisions[0].append(canonicalName);
const vernacularNames = g('in');
vernacularNames.classList.add('input', 'newSpeciesInput');
vernacularNames.placeholder = 'Common dolphin, Short-beaked common dolphin, Atlantic Dolphin, Pacific Dolphin, Black Sea Dolphin, Common Dolphin, Criss-Cross Dolphin';
titles[1].innerHTML = 'Vernacular Names';
divisions[1].append(vernacularNames);
const synonyms = g('te');
synonyms.classList.add('input', 'newSpeciesTextArea');
synonyms.placeholder = 'Delphinus albimanus, Delphinus algeriensis, Delphinus bairdi, Delphinus capensis, Delphinus capensis capensis, Delphinus delphus, Delphinus fluvofasciatus, Delphinus forsteri, Delphinus frithii, Delphinus fulvofasciatus, Delphinus loriger, Delphinus major, Delphinus marginatus, Delphinus microps, Delphinus moorei, Delphinus novaezealandiae, Delphinus novaezeelandiae, Delphinus novaezelandiae, Delphinus pliocaenicus, Delphinus pliocaenus, Delphinus ponticus, Delphinus sao, Delphinus zelandae, Eudelphinus delphis, Eudelphinus pliocaenus, Lagenorhynchus decastelnau'; 
synonyms.style.height = '150px';
titles[4].innerHTML = 'Synonyms';
divisions[4].append(synonyms);

// INFORMATION
const distributions = g('te');
distributions.classList.add('input', 'newSpeciesTextArea');
distributions.placeholder = 'Global, Mediterranean Sea, European Marine Waters, Eastern Atlantic Ocean, North West Atlantic, Portuguese Exclusive Economic Zone (Azores), Gulf of Maine, Gulf of Saint Lawrence, Western Indian Ocean, East Pacific, Indo-West Pacific';
titles[2].innerHTML = 'Distributions';
divisions[2].append(distributions);
const description = g('te');
description.classList.add('input', 'newSpeciesTextArea');
description.placeholder = "# Conservation\nleast concern\n\n# Activity\nThe Short-beaked Common Dolphin can be aerially active, especially in large groups; they frequently leap out of the water while traveling. They also will bow-ride vessels and sometimes even large mysticetes.\n\n# Biology Ecology\nHabitat: Tends to be more common in offshore than near-shore waters and generally not found in areas less than 180 m deep.";
titles[3].innerHTML = 'Description';
divisions[3].append(description);
const media = g('te');
media.classList.add('input', 'newSpeciesTextArea');
media.style.height = '150px';
media.placeholder = 'https://zenodo.org/record/6610948/files/figure.png'
titles[5].innerHTML = 'Media Links';
divisions[5].append(media);

const hint = g();
hint.innerHTML = "To add a new Species, a new / unique canonical name must be provided. Every other information is optional.<br>Separate multiple names, locations, links... using comma. In the description field, you can create headlines by putting a # at the beginning of the line.<br><br>Remember: Once a species has been added, you have to set condition selection to 'CANONICAL NAME' if you want query it for that name. The standard condition 'SPECIES' will only find it over vernacular names, if provided.<br><br>IMPORTANT<br>In this app, any added species will be saved to the local Django DB and NOT to the actual GBIF. If you query for a species, Life will always do a double-fetch, searching both databases and assembling results from both sources.";
hint.style.margin = '20px auto';
hint.style['font-style'] = 'italic';
hint.style['max-width'] = '500px';
hint.style['text-align'] = 'center';
const submit = g('b');
submit.classList.add('searchGo', 'newSpeciesSubmit', 'brightHover');
submit.style.width = '200px';
submit.style.display = 'block';
submit.innerHTML = 'Save to Database';
const addAncestorInfo = hint.cloneNode(true);
addAncestorInfo.innerHTML = "Below you can add the next ancestor / parent of this species (optional).<br>It must be of the rank <i>Genus</i> or higher; when choosing a rank, all higher ranks up to <i>Kingdom</i> will be added automatically.<br>The finder will suggest Genera, but you can use <i>Advanced Search</i> to find higher taxa ranks. HINT: Adding a lineage will improve searches.";
addAncestorInfo.style['margin-top'] = '50px';
newSpeciesSpace.append(hint, submit, addAncestorInfo);

const centerDiv2 = centerDiv.cloneNode(true);
if (!isMobile)
{
	centerDiv2.children[3].remove();
	centerDiv2.children[2].style['margin-right'] = '60px';
	centerDiv2.children[1].innerHTML = 'Add a direct ancestor'.toUpperCase();
	centerDiv2.style.height = '80px';
}
else centerDiv2.children[0].innerHTML = 'Add a direct ancestor'.toUpperCase();
newSpeciesSpace.append(centerDiv2);

const addLineage = g();
addLineage.classList.add('flexPart', 'center');
const parentSelectionTitle = g();
parentSelectionTitle.classList.add('selectTitle');
parentSelectionTitle.innerHTML = 'Canonical Name of a direct Ancestor';
parentSelectionTitle.style['margin-top'] = '20px';
const parentSelection = g('in');
parentSelection.classList.add('input');
parentSelection.placeholder = 'Delphinus';
const parentSuggestionTitle = parentSelectionTitle.cloneNode(true);
parentSuggestionTitle.style.color = '#4C9590';
parentSuggestionTitle.innerHTML = 'Look for a GENUS / direct Ancestor';
const parentSuggestion = parentSelection.cloneNode(true);
parentSelection.classList.add('parent');
parentSuggestion.classList.add('newSpeciesInput');
parentSuggestion.placeholder = 'Delph...';
const advancedSearch = submit.cloneNode(true);
advancedSearch.style['background-color'] = '#4C9590';
advancedSearch.innerHTML = 'Advanced Search';
const subDiv = g();
subDiv.append(parentSelectionTitle, parentSelection, parentSuggestionTitle, parentSuggestion, advancedSearch);
addLineage.append(subDiv);
const suggestionSpace = g();
suggestionSpace.classList.add('flexPart');
newSpeciesSpace.append(addLineage, suggestionSpace);

var isUniqueLocalAndGBIF = true;
var isUniqueGBIF = true;
var isUniqueLocal = true;
canonicalName.onmouseover = ()=> {if (isUniqueLocalAndGBIF) canonicalName.style['background-color'] = null}
canonicalName.onmouseout = ()=> {if (isUniqueLocalAndGBIF) canonicalName.style['background-color'] = null}
canonicalName.oninput = ()=>
{
	if (canonicalName.value.trim() === "")
	{
		canonicalName.style['background-color'] = null;
		isUniqueLocalAndGBIF = true;
		return;
	}
	fetch('https://api.gbif.org/v1/species?name='+canonicalName.value.trim()+'&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c')
	.then(response => response.json())
	.then(incoming =>{isUniqueCanonicalName((incoming.results[0] === undefined) ? true : false, null)}); // I can't comprehend why, but for canonical names the GBIF will actually send a results-array back, even though every canonical name is unique, and there would only be one result. It should actually be doing the same as with key queries, where it directly sends back the single species (any taxa), and not within a result array.
	fetch('/life/species?name='+canonicalName.value.trim())
	.then(response => response.json())
	.then(incoming =>{isUniqueCanonicalName(null, (incoming.results[0] === undefined) ? true : false)});
}

function isUniqueCanonicalName(GBIF, local)
{
	if (GBIF !== null) isUniqueGBIF = GBIF;
	if (local !== null) isUniqueLocal = local;
	isUniqueLocalAndGBIF = isUniqueGBIF && isUniqueLocal;
	if (isUniqueLocalAndGBIF) canonicalName.style['background-color'] = null;
	else canonicalName.style['background-color'] = '#ff444e';
}

var hasParent = false;
var theParent;
parentSelection.onmouseover = ()=> {if (parentSelection.value.trim() === "") parentSelection.style['background-color'] = '#84e1a9'}
parentSelection.onmouseout = ()=> {if (parentSelection.value.trim() === "") parentSelection.style['background-color'] = '#2BAF60'}
parentSelection.oninput = parentSelectionChange;
function parentSelectionChange()
{
	if (parentSelection.value.trim() === "")
	{
		parentSelection.style['background-color'] = '#2BAF60';
		hasParent = false;
		return;
	}
	fetch('https://api.gbif.org/v1/species?name='+parentSelection.value.trim()+'&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c')
	.then(response => response.json())
	.then(incoming => 
	{
		if (incoming.results[0] !== undefined && incoming.results[0].rank !== 'SPECIES')
		{
			
			parentSelection.style['background-color'] = null;
			hasParent = true;
			theParent = incoming.results[0];
		}
		else
		{
			parentSelection.style['background-color'] = '#ff444e';
			hasParent = false;
		}
	})
}

submit.onclick = ()=>
{
	if (!hasParent && parentSelection.value.trim() !== '')
	{
		parentSelection.animate({backgroundColor: ['#ff444e', '#FF8398', '#ff1d34', '#FF8398' , '#ff1d34', '#FF8398', '#ff444e']},1000);
		return;
	}
	else if (!isUniqueLocalAndGBIF || canonicalName.value.trim() === '')
	{
		canonicalName.animate({backgroundColor: ['#4C9590', '#FFB56C', 'orange', '#FFB56C', 'orange' , '#FFB56C', '#4C9590']},1000)
		return;
	}
		
	for (const div of divisions) div.children[1].value = div.children[1].value.replaceAll('\n','<br>').trim();
	while(description.value.indexOf('#') !== -1)
	{
		const position = description.value.indexOf('#');
		description.value = description.value.replace('#','<strong>');
		const endOfLine = description.value.indexOf('<br>',position);
		if (endOfLine === -1) description.value += '</strong>'; // last line
		else description.value = description.value.slice(0,endOfLine) + '</strong>'+ description.value.slice(endOfLine);
	}
		
	const content = {};
	const lineage = {};
	
	content['canonicalName'] = canonicalName.value;
	content['description'] = description.value;
		
	// generating arrays (even if there's just a single data) for media links, synonyms and vernacular names
	if (media.value.trim() !== "" && media.value.indexOf(',') !== -1) content['mediaLinks'] = media.value.split(',');
	else if (media.value.trim() !== "") content['mediaLinks'] = [media.value.trim()];
	if (synonyms.value.trim() !== "" && synonyms.value.indexOf(',') !== -1) content['synonyms'] = synonyms.value.split(',');
	else if (synonyms.value.trim() !== "") content['synonyms'] = [synonyms.value.trim()];
	if (vernacularNames.value.trim() !== "" && vernacularNames.value.indexOf(',') !== -1) content['vernacularNames'] = vernacularNames.value.split(',');
	else if (vernacularNames.value.trim() !== "") content['vernacularNames'] = [vernacularNames.value.trim()];
	if (distributions.value.trim() !== "" && distributions.value.indexOf(',') !== -1) content['distributions'] = distributions.value.split(',');
	else if (distributions.value.trim() !== "") content['distributions'] = [distributions.value.trim()];
	
	if (!hasParent) sendToBackend();
	else 
	{
		const r = theParent;
		for (const name of taxaKeys) if (r[name] !== undefined) // this check is in case of ancestries with gaps
		{
			lineage[name] = {
				canonicalName: r[name],
				key: r[name+'Key']
			}
		}
		sendToBackend();
	}

	function sendToBackend()
	{
		fetch('/life/species/newAddition',
		{
			method: 'POST',
			body: JSON.stringify
			({
				content: content,
				lineage: lineage,
			})
		})
		.then(async (response) =>
		{
			if (response.ok)
			{
				for (const div of divisions) div.children[1].value = "";
				parentSelection.value = "";
				parentSuggestion.value = "";
				suggestionSpace.innerHTML = "";
				alert("New Species successfully saved to DB");
				const theModule = await import('./startup.js');
				const closeFunction = theModule.closeNewSpeciesOccurrence;
				closeFunction(newSpeciesSpace);
			}
		})
	}
}

parentSuggestion.oninput = ()=> provideSuggestions(parentSuggestion, suggestionSpace, "", getClickedSuggestion); // GBIF sets rank to genus by default, which is what we want here.
function provideSuggestions(inputElement, areaForSuggestions, rank, clickOnSuggestionFun)
{
	areaForSuggestions.innerHTML = "";
	if (inputElement.value.trim() === "") return;
	fetch('https://api.gbif.org/v1/species/suggest?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=50&q='+inputElement.value+((rank !== '') ? '&rank='+rank : '' ))
	.then(response => response.json())
	.then(suggestions =>
	{
		suggestions = filterResults(suggestions);
		areaForSuggestions.append(suggestionTitle(((rank === '') ? '<i>GENERA</i> ' : '<i>'+rank.toUpperCase()+'</i> ') + 'Suggestions for <i>'+inputElement.value+'<i>'));
		let colorDegree = randomInt(0,360);
		const previousClick = {element: null, backgroundColor: null}
		for (const suggestion in suggestions)
		{
			colorDegree += 4;
			const aSuggestion = createSuggestionBlock(colorDegree);
			aSuggestion.innerHTML	= suggestions[suggestion].canonicalName; //+" <i>"+suggestions[suggestion].rank+"</i>";
			areaForSuggestions.append(aSuggestion);
			setTimeout(()=>
			{
				aSuggestion.animate({opacity: [0,1]},300).onfinish = ()=> aSuggestion.style.opacity = 1;
			},20*suggestion);
			aSuggestion.onclick = ()=>
			{
				suggestionBlockClickStyling(aSuggestion, previousClick);
				clickOnSuggestionFun(suggestions[suggestion]);
			}
		}
	});
}

advancedSearch.onclick = ()=> getFindSpace(advancedSearch, newSpeciesSpace);

function getFindSpace(trigger, beforeElement)
{
	if (taxaNavigator.style.display !== 'block')
	{
		beforeElement.after(taxaNavigator);
		taxaNavigator.style.display = 'block';
		taxaNavigator.animate({opacity: [0,1]},500);
		trigger.style.filter = 'brightness(1.2)'
	}
	else
	{
		taxaNavigator.animate({opacity: [1,0]},500).onfinish = ()=> taxaNavigator.style.display = 'none';
		trigger.style.filter = null;
	}
}

function getClickedSuggestion(selection)
{
	console.log(selection);
	parentSelection.value = (selection.canonicalName !== undefined) ? selection.canonicalName : selection.scientificName;
	parentSelectionChange();
}

export {newSpeciesSpace, closeNewSpeciesSpace, parentSelection, parentSelectionChange, provideSuggestions, getFindSpace};