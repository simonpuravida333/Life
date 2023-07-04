import {create} from './create.js';
import {taxaKeys, withinSearchActivated} from './startup.js';

var goThroughRanks = 0;

export default function search(querySubmit, rankSubmit)
{
	let fetchThis = "";
	
	if (isNaN(querySubmit) === false)
	{
		fetchThis = 'https://api.gbif.org/v1/species/'+querySubmit; // if user queries with keyID.
		rankSubmit = 'keyID';
		console.log('key ID query');
	}
	else if (rankSubmit === 'canonicalName')
	{
		fetchThis = 'https://api.gbif.org/v1/species?name='+querySubmit+'&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c';
		console.log('canonical name query');
	}
	else if (rankSubmit === 'allRanks')
	{
		for (let rank in taxaKeys)
		{
			search(querySubmit, taxaKeys[rank]);
		}
	}
	else if (rankSubmit === 'highestRank')
	{
		console.log(taxaKeys[goThroughRanks]);
		fetchThis = 'https://api.gbif.org/v1/species/search?q='+querySubmit+"&rank="+taxaKeys[goThroughRanks]+'&qField=VERNACULAR&limit=500&status=ACCEPTED&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c';
	}
	else if (withinSearchActivated)
	{
		if (isNaN(querySubmit) === false) checkResponse('https://api.gbif.org/v1/species/search?higherTaxonKey='+querySubmit+'&rank='+rankSubmit+'&limit=1000&status=ACCEPTED', querySubmit, 'within '+rankSubmit);
		else 
		{
			querySubmit = querySubmit.slice(0,1).toUpperCase()+querySubmit.slice(1).toLowerCase();
			fetch('https://api.gbif.org/v1/species/match?verbose=true&name='+querySubmit)
			.then(response => response.json())
			.then(incoming =>
			{
				//console.log(incoming);
				if (incoming.matchType === "NONE")
				{
					console.log('taxa ' +querySubmit+' does not exist');
					return;
				}
				else
				{
					fetchThis = 'https://api.gbif.org/v1/species/search?higherTaxonKey='+incoming.usageKey+'&rank='+rankSubmit+'&limit=1000&status=ACCEPTED';
					checkResponse(fetchThis, querySubmit, 'every '+rankSubmit+' within');
				}
			});
		}
	}
	else
	{
		let rankConditionFetchParam;
		if (rankSubmit === 'any') rankConditionFetchParam = "";
		else rankConditionFetchParam = "&rank="+rankSubmit;
		fetchThis = 'https://api.gbif.org/v1/species/search?q='+querySubmit+rankConditionFetchParam+'&qField=VERNACULAR&limit=1000&status=ACCEPTED&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c';
		console.log('vernacular name query');
	}
	if (!withinSearchActivated) checkResponse(fetchThis, querySubmit, rankSubmit);
}

function checkResponse(fetchThis, querySubmit, rankSubmit)
{
	fetch(fetchThis)
	.then(response => response.json())
	.then(incoming =>
	{
		// console.log(Object.prototype.toString.call(incoming));
		// console.log(Object.prototype.toString.call(incoming.results));
		// console.log(incoming.results)
		
		if (rankSubmit === 'keyID' && incoming.key === undefined)
		{
			console.log('Key not found. Returning!');
			return;
		}
		if (rankSubmit !== 'keyID')
		{
			if (incoming === undefined || incoming.results.length === 0)
			{
				console.log('Nothing fetched. Returning!');
				if (rankSubmit === 'highestRank' && goThroughRanks < 7)
				{
					goThroughRanks++;
					search(querySubmit, rankSubmit);
				}
				return;
			}
			else if (rankSubmit === 'highestRank') goThroughRanks = 0;
			
			// Why implementing "auto-search canonical name first every time" didn't work: I wanted to automate that whatever name the user queries, it will first query for a canonical name as there can always be one canonical name (across all ranks); if it wouldn't find something it would instantly go on doing a vernacular name fetch. The implementation was solid, and for many cases it worked (making strict string comparisons to avoid names in which e.g. 'lemur' appeared, disregarding capitals), but not for every:
			// The test case that broke it: searching for the scientific name 'lemur' will yield the GENUS 'Lemur', which contains the famous (and only) SPECIES 'ring-tailed lemur'. But in fact there're 14 more genera (plural GENUS) of lemur, with 8 FAMILIES and around a 100 SPECIES. Among the 15 genera just happened to be one with the sole scientific name 'Lemur' ...because it found a scientific name for lemur, with the implementation you couldn't do any other query. And there would be a second find: an insect called "Lemur Hübner" (scientific name) or just 'Lemur' (canonical name). Thus the "scientific name" condition had to be a selectable option after all.
		}
		if (rankSubmit === 'keyID') create([incoming], querySubmit, rankSubmit); // when searching for a key ID, it'll not send an array with objects, but the species object directly. So for the create function it gets put in an array.
		else create(incoming.results, querySubmit, rankSubmit); // gbif may respond with metadata object about the set, with the array of target objects being in '.results'.
	})
}