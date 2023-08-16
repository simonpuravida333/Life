const body = document.querySelector('body');

// NEW GBIF ENTRY
const newEntrySpace = document.createElement('div');
newEntrySpace.classList.add('blockRow');

const groupOfTwo = new Array(3);
const divisions = [];
const titles = [];

for (let x = 0; x < groupOfTwo.length; x++) groupOfTwo[x] = document.createElement('div');
for (let x = 0; x < groupOfTwo.length*2; x++)
{
	const division = document.createElement('div');
	divisions.push(division);
	const title = document.createElement('div');
	title.classList.add('selectTitle' ,'newEntryLabel');
	titles.push(title);
	division.append(title);
	groupOfTwo[Math.floor(x/2)].append(division);
	if (x%2 === 0)
	{
		groupOfTwo[Math.floor(x/2)].classList.add('flexPart');
		groupOfTwo[Math.floor(x/2)].style['align-items'] = "center";
		groupOfTwo[Math.floor(x/2)].style['justify-content'] = "center";
		newEntrySpace.append(groupOfTwo[Math.floor(x/2)]);
	}
}

// NAMING
const canonicalName = document.createElement('input');
canonicalName.classList.add('input', 'newEntryInput');
canonicalName.placeholder = 'Delphinus Delphi';
titles[0].innerHTML = 'Canonical Name';
divisions[0].append(canonicalName);
const vernacularNames = document.createElement('input');
vernacularNames.classList.add('input', 'newEntryInput');
vernacularNames.placeholder = 'Common dolphin, Short-beaked common dolphin, Atlantic Dolphin, Pacific Dolphin, Black Sea Dolphin, Common Dolphin, Criss-Cross Dolphin';
titles[1].innerHTML = 'Vernacular Names';
divisions[1].append(vernacularNames);
const synonyms = document.createElement('textArea');
synonyms.classList.add('input', 'newEntryTextArea');
synonyms.placeholder = 'Delphinus albimanus, Delphinus algeriensis, Delphinus bairdi, Delphinus capensis, Delphinus capensis capensis, Delphinus delphus, Delphinus fluvofasciatus, Delphinus forsteri, Delphinus frithii, Delphinus fulvofasciatus, Delphinus loriger, Delphinus major, Delphinus marginatus, Delphinus microps, Delphinus moorei, Delphinus novaezealandiae, Delphinus novaezeelandiae, Delphinus novaezelandiae, Delphinus pliocaenicus, Delphinus pliocaenus, Delphinus ponticus, Delphinus sao, Delphinus zelandae, Eudelphinus delphis, Eudelphinus pliocaenus, Lagenorhynchus decastelnau'; 
synonyms.style.height = '150px';
titles[4].innerHTML = 'Synonyms';
divisions[4].append(synonyms);

// INFORMATION
const distribution = document.createElement('textarea');
distribution.classList.add('input', 'newEntryTextArea');
distribution.placeholder = 'Global, Mediterranean Sea, European Marine Waters, Eastern Atlantic Ocean, North West Atlantic, Portuguese Exclusive Economic Zone (Azores), Gulf of Maine, Gulf of Saint Lawrence, Western Indian Ocean, East Pacific, Indo-West Pacific';
titles[2].innerHTML = 'Distribution';
divisions[2].append(distribution);
const description = document.createElement('textarea');
description.classList.add('input', 'newEntryTextArea');
description.placeholder = "# Conservation\nleast concern\n\n# Activity\nThe Short-beaked Common Dolphin can be aerially active, especially in large groups; they frequently leap out of the water while traveling. They also will bow-ride vessels and sometimes even large mysticetes.\n\n# Biology Ecology\nHabitat: Tends to be more common in offshore than near-shore waters and generally not found in areas less than 180 m deep."
titles[3].innerHTML = 'Description';
divisions[3].append(description);
const media = document.createElement('textarea');
media.classList.add('input', 'newEntryTextArea');
media.style.height = '150px';
media.placeholder = 'https://zenodo.org/record/6610948/files/figure.png'
titles[5].innerHTML = 'Media Links';
divisions[5].append(media);

const hint = document.createElement('div');
hint.innerHTML = "Seperate multiple names, locations, links... using comma or semicolon. In the description field you can create headlines by putting a # at the beginning of the line."
hint.style.margin = '10px';
hint.style['font-style'] = 'italic';
newEntrySpace.append(hint);
const submit = document.createElement('button');
submit.classList.add('searchGo', 'newEntrySubmit');
submit.style.width = '200px';
submit.style.display = 'block';
submit.style.margin = '0 auto';
submit.innerHTML = 'Save to Database';
newEntrySpace.append(submit);

submit.onclick =()=>
{
	for (const div of divisions) div.children[1].value = div.children[1].value.replaceAll('\n','<br>').trim();
	while(description.value.indexOf('#') !== -1)
	{
		const position = description.value.indexOf('#');
		description.value = description.value.replace('#','<strong>');
		const endOfLine = description.value.indexOf('<br>',position);
		if (endOfLine === -1) description.value += '</strong>'; // last line
		else description.value = description.value.slice(0,endOfLine) + '</strong>'+ description.value.slice(endOfLine);
	}
	const content = {
		canonicalName: canonicalName.value,
		vernacularNames: vernacularNames.value,
		synonyms: synonyms.value,
		distribution: distribution.value,
		description: description.value,
		media: media.value
	} // the whole job of this object is to allow an instant refresh of the fields when the user sends it off.
	for (const div of divisions) div.children[1].value = "";
	
	fetch('/newSpecies',
	{
		method: 'POST',
		body: JSON.stringify
		({newSpecies: content})
	})
	.then(response =>console.log(response));
}

export default newEntrySpace;