import {taxaKeys, ranks, allRankFilters} from './startup.js';
import {allGBIFResults} from './create.js';

const body = document.querySelector('body');
const allRanksOfResults = {};

function constructFilter()
{
	// REFRESH
	for (const rank of ranks)
	{
		while (allRankFilters[rank].children.length > 0)
		{
			allRankFilters[rank].children[0].remove(); // removes all the selectable option elements.
		}
	}
	
	for (let every in allRanksOfResults) delete allRanksOfResults[every]; // look at this fuss just to keep global 'const'.	
	console.log('FILTERS REFRESHED!');
	// END REFRESH
	
	const allOptionsArrays = [];
	for (const rank of ranks) allOptionsArrays[rank] = []; // gets all the options (or rather the string for 'value') for each rankFilter. The sole job of this array is to allow select-options to conveniently get sorted alphabetically, or I would have created the options directly (where I now first put them into this array).

	for (const result of allGBIFResults)
	{
		const targetRankIndex = taxaKeys.indexOf(result.targetRank);
		
		const arrayOfRanks = [];
		for (const rank of ranks)
		{
			if (result[taxaKeys[rank]].canonicalName === "" && rank < targetRankIndex) arrayOfRanks.push('No rank.'); // making certain that 'No rank.' is distinguishable from empty strings that would come after targetRank. This is important to being able to display 'No rank.' if a rankFilter doesn't have a rank.
			else arrayOfRanks.push(result[taxaKeys[rank]].canonicalName);
		}
		allRanksOfResults[result[result.targetRank].canonicalName] = arrayOfRanks; // the allRanksOfResults object gets as they key the canonicalName of the targetRank of the GBIFResult, which is unique among the results.
		
		for (const rank of ranks)
		{
			if (rank > targetRankIndex) break;
			if (checkAlreadyThere(allOptionsArrays[rank], result[taxaKeys[rank]].canonicalName) || result[taxaKeys[rank]].canonicalName === "") continue; // the second if-condition checks for non-available ranks (see create.js).
			allOptionsArrays[rank].push(result[taxaKeys[rank]].canonicalName);
		}
	}
	for (const rank of ranks) allOptionsArrays[rank].sort();
	
	for (const rank of ranks)
	{
		for (const option of allOptionsArrays[rank])
		{
			const opt = document.createElement('option');
			opt.value = option;
			opt.innerHTML = option;
			allRankFilters[rank].append(opt);
		}
	}
			
	for (const rank of ranks) // add '...' for inactive filter, and 'No Rank.' in case there isn't one.
	{
		const opt = document.createElement('option');
		opt.value = '...'
		opt.innerHTML = '...'
		allRankFilters[rank].append(opt);
		if (rank === 0 || rank === 6) continue;
		const opt2 = document.createElement('option');
		opt2.value = 'No rank.';
		opt2.innerHTML = '<i>No rank.</i>';
		allRankFilters[rank].append(opt2);
	}
	selectRank(-1); // initialize filter selection after having queried new results
}

function selectRank(rankIndex)
{
	let targetArray;
	
	if (rankIndex < 0 || allRankFilters[rankIndex].value === '...' || allRankFilters[rankIndex].value === 'No rank.')
	{
		if (rankIndex < 0) rankIndex = 0;
		for (let x = rankIndex; x < ranks.length; x++) allRankFilters[x].value = '...';
	}
	else
	{
		for (const key in allRanksOfResults)
		{
			if (allRanksOfResults[key][rankIndex] === allRankFilters[rankIndex].value)
			{
				targetArray = allRanksOfResults[key];
				break;
			}
		}
		for (const rank of ranks)
		{
			if (rank > rankIndex) allRankFilters[rank].value = '...';
			else allRankFilters[rank].value = targetArray[rank];
		}
	}

	for (const rank of ranks)
	{
		if (allRankFilters[rank].value.length > 9)
		{
			const moreLetters = allRankFilters[rank].value.length-9;
			allRankFilters[rank].style.width = 140+15*moreLetters+'px';
		}
		else allRankFilters[rank].style.width = 140+'px';
	}
	if (rankIndex > -1) filterResults();
}

function filterResults()
{	
	let filterParameter = '...';
	let taxaKey = '';
	for (const x of ranks)
	{
		if (allRankFilters[x].value === '...') break;
		filterParameter = allRankFilters[x].value;
		taxaKey = taxaKeys[x];
	}
	if (filterParameter !== '...')
	{
		for (const result of allGBIFResults)
		{
			if (result[taxaKey].canonicalName !== filterParameter) result.wholeArea.style.display = 'none';
			else if (result.wholeArea.style.display === 'none') result.wholeArea.style.display = 'block';
		}
	}
	else
	{
		for (const result of allGBIFResults)
		{
			if (result.wholeArea.style.display === 'none') result.wholeArea.style.display = 'block';
		}
	}
}

function checkAlreadyThere(optionsArray, newOpt)
{
	for (const option of optionsArray) if(option === newOpt) return true;
	return false;
}

export {constructFilter, selectRank};