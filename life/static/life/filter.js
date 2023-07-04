import {taxaKeys, ranks, allRankFilters} from './startup.js';
import {allGBIFResults} from './create.js';

const body = document.querySelector('body');
const allRanksOfAllResults = {}; // for every result this object gets an array with the canonicalNames from kingdom to targetRank. The key for the array is the canonicalName of targetRank

// everything in filter.js works over the canonicalName. It's convienient as it is guaranteed to be always unique.

function constructFilter()
{
	// REFRESH
	for (const index of ranks)
	{
		while (allRankFilters[index].children.length > 0) allRankFilters[index].children[0].remove(); // removes all the selectable option elements.
	}
	
	for (let every in allRanksOfAllResults) delete allRanksOfAllResults[every]; // look at this fuss, just to keep global (modul-wide, actually) 'const'.
	for (let every in howManySpecies) delete howManySpecies[every];
	console.log('FILTERS REFRESHED!');
	// END REFRESH
	
	const everyArrayOfOptions = []; // an array that holds seven rank-arrays, each with all the filter options / canonicalNames of that rank
	for (const index of ranks) everyArrayOfOptions[index] = []; // gets all the options (or rather the string for 'value') for each rankFilter. The sole job of this array is to allow select-options to conveniently get sorted alphabetically, or I would have created the options directly (instead of first putting them into this array).
	// END REFRESH

	for (const result of allGBIFResults) // fills allRanksOfAllResults with an array for every result. The array arrayOfRanks holds every canonicalName of every rank from kingdom to targetRank
	{
		const targetRankIndex = taxaKeys.indexOf(result.targetRank);
		
		const arrayOfRanks = [];
		for (const index of ranks)
		{
			if (result[taxaKeys[index]].canonicalName === "" && index < targetRankIndex) arrayOfRanks.push('No rank.'); // making certain that 'No rank.' is distinguishable from empty strings that would come after targetRank. This is important to being able to display 'No rank.' if there isn't one (a species that has no CLASS rank e.g.).
			else arrayOfRanks.push(result[taxaKeys[index]].canonicalName);
		}
		allRanksOfAllResults[result[result.targetRank].canonicalName] = arrayOfRanks; // the allRanksOfAllResults object gets as the key the canonicalName of the targetRank of the GBIFResult, which is always unique.
		
		for (const index of ranks) // here we add the options to every rank / every filter. But we make certain that there are no duplicates using checkAlreadyThere(), otherwise Phylym would have many 'mammalia' e.g. when searching for 'whale'.
		{
			if (index > targetRankIndex) break;
			if (checkAlreadyThere(everyArrayOfOptions[index], result[taxaKeys[index]].canonicalName) || result[taxaKeys[index]].canonicalName === "") continue; // the second if-condition checks for non-available ranks (see create.js).
			everyArrayOfOptions[index].push(result[taxaKeys[index]].canonicalName);
		}
	}
	for (const index of ranks) everyArrayOfOptions[index].sort(); // sort the options alphabetically
	
	for (const index of ranks) // create option elements and add to filters.
	{
		for (const option of everyArrayOfOptions[index])
		{
			const opt = document.createElement('option');
			opt.value = option;
			if(howManySpecies[option]!== undefined) opt.innerHTML = option + " ("+howManySpecies[option]+")";
			else opt.innerHTML = option;
			allRankFilters[index].append(opt);
		}
	}
			
	for (const index of ranks) // add '...' for inactive filter, and 'No Rank.'
	{
		const opt = document.createElement('option');
		opt.value = '...'
		opt.innerHTML = '...'
		allRankFilters[index].append(opt);
		if (index === 0 || index === 6) continue; // 'No rank.' doesn't exist for kingdom, neither does it for species (if you find a species result, then it obviously exists). In between though appropriate ranks is still very much an ongoing debate of classification in the life science community.
		const opt2 = document.createElement('option');
		opt2.value = 'No rank.';
		opt2.innerHTML = '<i>No rank.</i>';
		allRankFilters[index].append(opt2);
	}
	selectRank(-1); // initialize filter selection after having queried new results
}

function selectRank(rankIndex) // this function is called every time the user selects a rank. It sets any rank upwards of the interacted one with the appropriate parent and sets every rank below to '...' as multiple options of those filters may be displayed.
{
	let targetArray;
	
	if (rankIndex < 0 || allRankFilters[rankIndex].value === '...' || allRankFilters[rankIndex].value === 'No rank.')
	{
		if (rankIndex < 0) rankIndex = 0;
		for (let x = rankIndex; x < ranks.length; x++) allRankFilters[x].value = '...';
	}
	else
	{
		for (const key in allRanksOfAllResults) // picking out the right array from allRanksOfAllResults to get the parents by checking the same rank of up to every array of allRanksOfAllResults
		{
			if (allRanksOfAllResults[key][rankIndex] === allRankFilters[rankIndex].value) // .value is what is selected right now in the filter. That's why we only need to know which filter has been interacted with.
			{
				targetArray = allRanksOfAllResults[key];
				break;
			}
		}
		for (const index of ranks) // setting children to '...'
		{
			if (index > rankIndex) allRankFilters[index].value = '...';
			else allRankFilters[index].value = targetArray[index];
		}
	}

	for (const index of ranks) // when the canonicalNames are long, the filter element gets wider. It has 140px width for any "canonicalName (number)" where the name is 9 letters or less. For every letter more than 9 it adds 15px width. It's an approximation.
	{
		let moreLetters = 0;
		for (const option of allRankFilters[index].options) if (option.value === allRankFilters[index].value) if (option.innerHTML.search(/\([0-9]*\)/) !== -1) moreLetters += option.innerHTML.search(/[0-9]\)/) - option.innerHTML.search(/\([0-9]/) +3; // digits within the parentheses, the +3 is for the space between canonicalName and parentheses, plus the two parentheses.
		if (allRankFilters[index].value.length < 10) moreLetters -= 10-allRankFilters[index].value.length;
		else moreLetters += allRankFilters[index].value.length-10;
		if (moreLetters < 0) moreLetters = 0;
		allRankFilters[index].style.width = (150+15*moreLetters)+'px';
		
	}
	if (rankIndex > -1) filterResults();
	highlightOptionsLowerRanks(rankIndex);
}

function filterResults() // select the results accordingly to the set filter.
{	
	let filterParameter = '...';
	let taxaKey = '';
	for (const index of ranks)
	{
		if (allRankFilters[index].value === '...') break;
		filterParameter = allRankFilters[index].value;
		taxaKey = taxaKeys[index];
	}
	if (filterParameter !== '...')
	{
		for (const result of allGBIFResults) // make only selection visible by checking whether the rank of the result has the same canonical name as the one the user selected in the filter of the same rank
		{
			if (result[taxaKey].canonicalName !== filterParameter) result.wholeArea.style.display = 'none';
			else if (result.wholeArea.style.display === 'none') result.wholeArea.style.display = 'block';
		}
	}
	else //... or make every result visible.
	{
		for (const result of allGBIFResults)
		{
			if (result.wholeArea.style.display === 'none') result.wholeArea.style.display = 'block';
		}
	}
}

const howManySpecies = {}; // SPECIES, or higher targetRank if searched for. I just selected 'species' in the name to make clear that it only counts the amount of the lowest rank. Meaning it will show '17' for Animalia in KINGDOM if there're 17 species found. ... meaning it will not count the amount GENERA, FAMILIES... This is intended design.
function checkAlreadyThere(optionsArray, newOpt)
{
	for (const option of optionsArray) if(option === newOpt)
	{
		if (howManySpecies[newOpt] === undefined) howManySpecies[newOpt] = 2; // when the if-condition right after the loop checks out, it means there's been already one, so this one is the second.
		else howManySpecies[newOpt] += 1;
		return true;
	}
	return false;
}

function highlightOptionsLowerRanks(rankIndex)
{
	for (const filter of allRankFilters) for (const option of filter.options) option.classList.remove('highlightFilterOption');
	if (rankIndex === 6 || allRankFilters[0].value === '...') return;
	const selectedArrays = [];
	
	if (allRankFilters[rankIndex].value === '...') rankIndex--; // if a rank is reset ('...') move a rank higher to make array selections on the higher rank
	for (const array in allRanksOfAllResults) if (allRankFilters[rankIndex].value === allRanksOfAllResults[array][rankIndex]) selectedArrays.push(allRanksOfAllResults[array]);
	
	if (allRankFilters[rankIndex].value === '...') rankIndex += 2;
	else rankIndex++; // move a rank lower to make highlighting in the options from the rank one lower and onwards of user filter choice

	for (let index = rankIndex; index < ranks.length; index++)
	{
		for (const option of allRankFilters[index].options)
		{
			for (const array of selectedArrays) if(option.value === array[index])
			{
				option.classList.add('highlightFilterOption');
				console.log('HAPPENING');
			}
		}
	}
}

export {constructFilter, selectRank};