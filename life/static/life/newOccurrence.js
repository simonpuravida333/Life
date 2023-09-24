import {provideSuggestions, getFindSpace, newSpeciesSpace} from './newSpecies.js';
import {countryCodesOnly, countryNamesOnly} from './officialDesignations.js';

const body = document.querySelector('body');

// let's do some recycling > CLONING THE "NEW SPECIES" LAYOUT
// UPPER PART FROM "NEW SPECIES"
const guideText = g();
const submit = newSpeciesSpace.children[5].cloneNode(true);
const findSpeciesTitle = newSpeciesSpace.children[7].cloneNode(true);
const advancedSearch = newSpeciesSpace.children[8].children[0].children[4].cloneNode(true);

// LOWER PART FROM "NEW SPECIES"
const findSpecies = newSpeciesSpace.children[8].children[0].cloneNode(true);
const speciesSuggestionTitle = findSpecies.children[0];
const suggestionInput = findSpecies.children[1];
const speciesSelectionTitle = findSpecies.children[2];
const speciesSelection = findSpecies.children[3];

guideText.innerHTML = 'Add an OCCURRENCE to a species.<br>In the GBIF, occurrences are sightings of specieses with the aim to create a record about numbers and distribution. This app is designed to only load occurrences that have an image, so providing an image link is mandatory, every other information is optional. It is possible to use the image link field multiple times for the same occurrence: that is if multiple images have been taken during one sighting. This saves you the hassle of having the refill the other data fields - just let them be while adding more image link fields.<br><br>IMPORTANT<br>In this app, new occurrences will get added to the local Django DB and NOT to the actual GBIF. If you then look up the species, it Life will do a double-fetch, calling your local occurrences first and putting their images first, followed by the occurrence images from the GBIF.';
guideText.style.margin = '20px auto';
guideText.style['font-style'] = 'italic';
guideText.style['max-width'] = '500px';
guideText.style['text-align'] = 'center';
if (isMobile) findSpeciesTitle.children[0].innerHTML = 'SELECT A SPECIES';
else findSpeciesTitle.children[1].innerHTML = 'SELECT A SPECIES';
speciesSelectionTitle.innerHTML = 'The Species:';
speciesSuggestionTitle.innerHTML = 'Look for a Species...';
suggestionInput.placeholder = 'Delph...';
speciesSelection.placeholder = 'Delphinus Delphis';

// let's wipe most of the area, except the upper title, and add everything manually, so that we idea of how which elements are added where:
const newOccurrenceSpace = newSpeciesSpace.cloneNode(true);
while (newOccurrenceSpace.children.length > 1) newOccurrenceSpace.children[1].remove();
const topTitle = (isMobile) ? newOccurrenceSpace.children[0].children[0] : newOccurrenceSpace.children[0].children[1];
topTitle.innerHTML = 'add a new occurrence'.toUpperCase();
const closeNewOccurrence = (!isMobile) ? newOccurrenceSpace.children[0].children[3] : null;
if (!isMobile)
{
	closeNewOccurrence.onmouseover = ()=> closeNewOccurrence.innerHTML = '⦿';
	closeNewOccurrence.onmouseout = ()=> closeNewOccurrence.innerHTML = '⊙';
}

const selectionArea = g();
const dataArea = g();
selectionArea.classList.add('flexPart');

const subDiv = g();
const center = g();
const suggestionArea = g();
center.classList.add('flexPart', 'center');
suggestionArea.classList.add('flexPart');
subDiv.append(speciesSelectionTitle, speciesSelection, submit, speciesSuggestionTitle, suggestionInput, advancedSearch);
center.append(subDiv);
newOccurrenceSpace.append(selectionArea, dataArea, guideText, findSpeciesTitle, center, suggestionArea);
speciesSelection.oninput = speciesSelectionChange;
suggestionInput.oninput = ()=> provideSuggestions(suggestionInput, suggestionArea, 'species', getClickedSuggestion);
advancedSearch.onclick = ()=>	getFindSpace(advancedSearch, newOccurrenceSpace);
submit.onclick = sendToBackend;

const enteredData = {};
const allOKs = [];
const data = { // third slot is the condition for submit that must be met
	// ANY LETTER STRING
	waterBody: ['Water body', 'Name an ocean, ocean region, lake...', /[a-z]{2,}/i],
	locality: ['Locality', 'Name a place, like the name of a mountain, bay, county...', /[a-z]{2,}/i], // "NY"
	identifiedBy: ['Identified by', '', /\w/],
	recordedBy: ['Recorded by', '', /\w/],
	identificationRemarks: ['Identification remarks', '', /\w/],
	
	// NUMBERS
	elevation: ['Elevation', 'In meters.', 'number'],
	depth: ['Depth', 'In meters. If an occurrence was recorded under water.', 'number'],
	decimalLongitude: ['Longitude', "Integer or floating point.", 'number'],
	decimalLatitude: ['Latitude', "Integer or floating point.", 'number'],
	individualCount: ['Individual count', '', 'number'],
	
	// DIRECT STRING COMPARISONS
	continent: ['Continent', '', ['Asia','Africa', 'North America', 'South America','Antarctica','Europe', 'Australia']],
	basisOfRecord: ['Basis of record', 'Living Specimen, Preserved Specimen, Fossil Specimen, Material Citation, Human Observation, Machine Observation',['Living Specimen', 'Preserved Specimen', 'Fossil Specimen', 'Material Citation', 'Human Observation', 'Machine Observation']],
	isInCluster: ['Is in cluster', 'yes / no', ['yes', 'no']],
	sex: ['Sex', 'male / female', ['male','female']],
	establishmentMeans: ['Establishment means', 'introduced, invasive, managed, native, naturalised, uncertain', ['introduced', 'invasive' ,'managed' ,'native' ,'naturalised' ,'uncertain']],
	iucnRedListCategory: ['IUCN red list category', 'NE (Not evaluated), DD (Data deficient), LC (Least concern), NT (Near threatened), VU (Vulnerable) EN (Endangered) CR (Critically endangered), EX (Extinct), EW (Extinct in the wild)', ['NE', 'DD', 'LC', 'NT', 'VU', 'EN', 'CR', 'EX', 'EW']],
	countryCode: ['Country Code', '', countryCodesOnly],
	country: ['Country', '', countryNamesOnly],
	
	// REGEX MATCHES
	date: ['Date', 'YYYY:MM:DD', /[0-2][0-9]{3}:(0[0-9]|1[0-2]):([0-2][0-9]|3[0-1])/, 10],
	eventTime: ['Time', 'HH:MM:SS', /(([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])/, 8],
	mediaLinks: ['Image Link', '',/\w.jpg$|\w.jpeg$|\w.jpe$|\w.jif$|\w.jfif$|\w.jfi$|\w.webp$|\w.gif$|\w.png$|\w.apgn$|\w.bmp$|\w.dib$/] // allows for local images to be loaded.
};

for (const d in data)
{
	const div = g();
	div.innerHTML = "+ "+data[d][0];
	div.classList.add('suggestionBlock', 'brightHover');
	if (d === 'mediaLinks') div.style['background-color'] = 'orange';
	else div.style['background-color'] = '#4C9590';
	div.style.opacity = 1;
	div.style.color = 'white';
	div.onclick = ()=> openInput((d === 'mediaLinks') ? div.cloneNode(true) : div, d);
	selectionArea.append(div);
	
	if (data[d][1] !== '' && !isMobile)
	{
		const hoverDiv = g();
		hoverDiv.classList.add('baseBlock', 'hoverHelp');
		hoverDiv.style['background-color'] = '#325D77';
		hoverDiv.innerHTML = data[d][1];
		body.append(hoverDiv);
		div.onmouseover = ()=>
		{
			hoverDiv.style.display = 'block';
			if (div.offsetLeft + div.getBoundingClientRect().width/2 - hoverDiv.getBoundingClientRect().width/2 >= 0) hoverDiv.style.left = div.offsetLeft + div.getBoundingClientRect().width/2+'px';
			else hoverDiv.style.left = hoverDiv.getBoundingClientRect().width/2+ 'px';
			hoverDiv.style.top = div.offsetTop - hoverDiv.getBoundingClientRect().height - 20 + 'px';
		}
		div.onmouseout = ()=> hoverDiv.style.display = 'none';
	}
}

function openInput(div, dataKey)
{
	const dataEntry = g();
	dataEntry.classList.add('flexPart');
	dataArea.append(dataEntry);
	const input = g('in');
	input.classList.add('input', 'newSpeciesInput');
	div.style['background-color'] = '#2BAF60';
	input.style['background-color'] = '#FF6680';
	input.style.color = 'white';
	const removeDataEntry = g();
	removeDataEntry.innerHTML = '⊙';
	removeDataEntry.classList.add('closeNewSpeciesSpace');
	removeDataEntry.onmouseover = ()=> removeDataEntry.innerHTML = '⦿';
	removeDataEntry.onmouseout = ()=> removeDataEntry.innerHTML = '⊙';
	dataEntry.append(removeDataEntry, div, input);
	div.onclick = null;
	const ok = {ok: false, input: input}
	allOKs.push(ok)
	
	if (dataKey === 'mediaLinks')
	{
		if (enteredData['mediaLinks'] !== undefined) enteredData['mediaLinks'].push(input)
		else enteredData['mediaLinks'] = [input];
	}
	else enteredData[dataKey] = input;
	
	let countrySuggestion;
	if (dataKey === 'country')
	{
		countrySuggestion = g();
		countrySuggestion.style.display = 'none';
		countrySuggestion.style.position = 'absolute';
		countrySuggestion.style['background-color'] = 'white';
		countrySuggestion.style.color = '#325D77';
		countrySuggestion.style.padding = '10px';
		countrySuggestion.style['border-radius'] = '10px';
		countrySuggestion.style.opacity = 1;	
		body.append(countrySuggestion);
		input.addEventListener('focusout', ()=> setTimeout(()=>{countrySuggestion.style.display = 'none';},500)) // without the delay it is not possible to click on a country.
	}
	
	const help = g(); // mobile
	if (isMobile && data[dataKey][1] !== '')
	{
		help.classList.add('mobileDataHelp');
		help.innerHTML = data[dataKey][1];
		input.before(help);
		input.addEventListener('focus',()=>
		{
			help.style.display = 'block';
			help.style.top = input.getBoundingClientRect().height - help.getBoundingClientRect().height + 'px';
			help.style.left = input.offsetLeft + 'px';
		});
		input.addEventListener('focusout', ()=>
		{
			help.style.display = 'none';
		});
	}

	input.oninput = ()=>
	{
		let entry = input.value.trim().toLowerCase();
		ok.ok = true;
		
		if (dataKey === 'country')
		{
			if (entry.length >= 4)
			{
				countrySuggestion.innerHTML = '<strong>';
				countrySuggestion.style.display = 'block';
				countrySuggestion.style.left = input.offsetLeft + 'px';
				countrySuggestion.style.width = input.getBoundingClientRect().width+'px';
			}
			else countrySuggestion.style.display = 'none';
		}
		if (Array.isArray(data[dataKey][2]))
		{
			for (const choice of data[dataKey][2])
			{
				if (dataKey === 'country' && entry.length >= 4 && choice.toLowerCase().includes(entry.toLowerCase()))
				{
					const c = g();
					c.innerHTML = choice;
					c.classList.add('suggestionBlock');
					c.style.opacity = 1;
					c.onclick = ()=>
					{
						input.value = choice;
						ok.ok = true;
						input.style['background-color'] = '#2BAF60';
						c.style['background-color'] = 'orange';
						c.style.color = 'white';
					}
					countrySuggestion.append(c);
					countrySuggestion.style.top = input.offsetTop - 20 - countrySuggestion.getBoundingClientRect().height + 'px';
				}
				if (entry === choice.toLowerCase())
				{
					ok.ok = true;
					break;
				}
				else ok.ok = false;
			}
		}
		else if (data[dataKey][2] === 'number')
		{
			if (!isNaN(entry))
			{
				ok.ok = true;
				if ((dataKey === 'individualCount' || dataKey === 'elevation' || dataKey === 'depth') && /\./.test(entry)) ok.ok = false;
				else if ((dataKey === 'decimalLongitude' || dataKey === 'decimalLatitude') && (parseInt(entry) >= 180 || parseInt(entry) <= -180)) ok.ok = false;
			}
			else if (entry !== '-') ok.ok = false; // when someone starts typing with a minus (for negative decimalLatitudes e.g., it should not turn red instantly)
		}
		else // regex pattern
		{
			let len = (data[dataKey][3] !== undefined) ? entry.length === data[dataKey][3] : true;
			if (data[dataKey][2].test(entry) && len) ok.ok = true;
			else ok.ok = false;
		}
		if (ok.ok) input.style.backgroundColor = '#2BAF60';
		else input.style.backgroundColor = '#FF6680';
	}
	
	removeDataEntry.onclick = ()=>
	{
		removeDataEntry.onclick = null;
		dataEntry.animate({opacity:[1,0]},250).onfinish =()=>
		{
			if (dataKey !== 'mediaLinks')
			{
				div.onclick = ()=> openInput(div, dataKey);
				selectionArea.append(div);
				div.animate({opacity: [0,1]},250);
			}
			dataEntry.remove();
			if (dataKey === 'country') countrySuggestion.remove();
			div.style['background-color'] = '#4C9590';
			
			if (dataKey === 'mediaLinks' && enteredData['mediaLinks'] !== undefined)
			{
				if (enteredData['mediaLinks'].length === 1) delete enteredData['mediaLinks'];
				else for (let x = 0; x < enteredData['mediaLinks'].length; x++) if (enteredData['mediaLinks'][x] === input) enteredData['mediaLinks'].splice(x, 1);
			}
			else delete enteredData[dataKey];
			for (const o in allOKs) if (input === allOKs[o].input) allOKs.splice(o,1);
		}
		help.remove();
	}
}

function getClickedSuggestion(selection)
{
	console.log(selection);
	speciesSelection.value = (selection.canonicalName !== undefined) ? selection.canonicalName : selection.scientificName;
	speciesSelectionChange();
}

var hasSpecies = false;
var theSpecies;
function	speciesSelectionChange()
{
	if (speciesSelection.value.trim() === '')
	{
		speciesSelection.style['background-color'] =null;
		hasSpecies = false;
		return;
	}
	
	// ADD LOCAL DJANGO CHECK
	
	fetch('https://api.gbif.org/v1/species?name='+speciesSelection.value.trim()+'&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c')
	.then(response => response.json())
	.then(incoming => 
	{
		if (incoming.results[0] === undefined || incoming.results[0].rank !== 'SPECIES')
		{
			speciesSelection.style['background-color'] = '#ff444e';
			theSpecies = null;
			hasSpecies = false;
		}
		else
		{
			theSpecies = incoming.results[0];
			speciesSelection.style['background-color'] = null;
			hasSpecies = true;
		}
	});
}

function sendToBackend()
{
	// CHECKING FILL OUT PREREQUISITES
	let notYet = false;
	if (enteredData['mediaLinks'] === undefined) for (const element of Array.from(selectionArea.children)) if (element.innerHTML.toLowerCase().includes('image')) {element.click(); break;}
	for (const ok of allOKs) if (!ok.ok)
	{
		ok.input.animate({backgroundColor: ['#FF6680', '#FF8398', '#ff1d34', '#FF8398' , '#ff1d34', '#FF8398', '#FF6680']}, 1000);
		notYet = true;
	}
	if (!hasSpecies) speciesSelection.animate({backgroundColor: ['#325D77', '#FF8398', '#ff1d34', '#FF8398' , '#ff1d34', '#FF8398', '#325D77']}, 1000);
	if (notYet || !hasSpecies) return;
	
	// CLEANING DATA
	for (const key in enteredData) if(key !== 'mediaLinks') if (enteredData[key].value.trim() === '') delete enteredData[key];
	for (const key in enteredData)
	{
		if (key === 'mediaLinks')
		{
			const newArr = [];
			for (const link of enteredData['mediaLinks']) if (link.value.trim() !== '') newArr.push(link.value);
			if (newArr.length === 0) delete enteredData['mediaLinks'];
			else enteredData['mediaLinks'] = newArr;
		}
		else enteredData[key] = enteredData[key].value.trim();
	}
	
	for (const rank of taxaKeys)
	{
		if (theSpecies[rank] === undefined) continue;
		enteredData[rank] = theSpecies[rank];
		enteredData[rank+'Key'] = theSpecies[rank+'Key'];
	}
	if (enteredData.iucnRedListCategory !== undefined) enteredData.iucnRedListCategory = enteredData.iucnRedListCategory.toUpperCase();
	if (enteredData.basisOfRecord !== undefined) enteredData.basisOfRecord = caps(enteredData.basisOfRecord);
	if (enteredData.isInCluster !== undefined)
	{
		if (enteredData.isInCluster.toLowerCase() === 'yes') enteredData.isInCluster = true;
		else enteredData.isInCluster = false;
	}
	if (enteredData.establishmentMeans !== undefined) enteredData.establishmentMeans = enteredData.establishmentMeans.toUpperCase();
	if (enteredData.time !== undefined && enteredData.date === undefined) delete enteredData.time; // either date OR date + time, but not time without a date
	if (enteredData.date !== undefined)
	{
		enteredData['year'] = parseInt(enteredData.date.slice(0,4));
		enteredData['month'] = parseInt(enteredData.date.slice(5,7));
		enteredData['day'] = parseInt(enteredData.date.slice(8));
	}
	console.log('ENTERED DATA:\n' + enteredData);
	fetch('/life/occurrence/newAddition',
	{
		method: 'POST',
		body: JSON.stringify
		(enteredData)
	})
	.then(async (response) =>
	{
		if (response.ok)
		{
			speciesSelection.value = '';
			suggestionInput.value = '';
			suggestionArea.innerHTML = '';
			for (const child of dataArea.children) child.children[0].click();
			for (const key in enteredData) delete enteredData[key];
			setTimeout(()=>{alert("New Occurrence successfully saved to DB")},500);
			const theModule = await import('./startup.js');
			const closeFunction = theModule.closeNewSpeciesOccurrence;
			closeFunction(newOccurrenceSpace);
		}
	})
}

export {newOccurrenceSpace, closeNewOccurrence, speciesSelection, speciesSelectionChange}