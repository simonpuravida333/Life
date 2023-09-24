import json
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize

from .models import Kingdom, Phylum, ClassRank, Order, Family, Genus, Species, SpeciesMedia, SynonymName, Distribution, VernacularName, Description, Occurrence, OccurrenceMedia

# caution: mind the difference of 'class' and 'classRank' between JSON strings and code respectively (on both stack-ends)
higherTaxaClasses = [Kingdom, Phylum, ClassRank, Order, Family, Genus]
higherTaxa = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus']
allRanks = ['kingdom', 'phylum', 'classRank', 'order', 'family', 'genus', 'theSpecies', 'kingdomKey', 'phylumKey', 'classRankKey', 'orderKey', 'familyKey', 'genusKey', 'speciesKey']
speciesFields = ['canonicalName', 'theSpecies', 'key', 'speciesKey', 'rank', 'taxonomicStatus', 'nameType', 'parent', 'parentKey', 'kingdom', 'phylum', 'classRank', 'order', 'family', 'genus', 'kingdomKey', 'phylumKey', 'classRankKey', 'orderKey', 'familyKey', 'genusKey', 'localDjangoDB']
occurrencesFields = ['waterBody', 'continent', 'country', 'countryCode', 'locality', 'elevation', 'depth', 'decimalLatitude', 'decimalLongitude', 'basisOfRecord', 'identifiedBy', 'recordedBy', 'isInCluster', 'individualCount', 'sex', 'identificationRemarks', 'establishmentMeans', 'iucnRedListCategory', 'eventTime', 'day', 'month', 'year']
JSONSpeciesFields = ['canonicalName', 'vernacularNames', 'synonyms', 'distributions', 'description', 'mediaLinks']
JSONOccurrenceFields = ['waterBody', 'locality', 'identifiedBy', 'recordedBy', 'identificationRemarks', 'elevation', 'depth', 'decimalLongitude', 'decimalLatitude', 'individualCount', 'continent', 'basisOfRecord', 'isInCluster', 'sex', 'establishmentMeans', 'iucnRedListCategory', 'countryCode', 'country', 'eventTime', 'year', 'month', 'day']
JSONHigherTaxa = ["kingdom", "phylum", "class", "order", "family", "genus"]
JSONRanks = ["kingdom", "phylum", "class", "order", "family", "genus", "species"]
JSONRanksKeys = ["kingdomKey", "phylumKey", "classKey", "orderKey", "familyKey", "genusKey", "speciesKey"]
imageFileTypes = ["jpg","jpeg","jpe","jif","jfif","jfi","webp","gif","png","apgn","bmp","dib"]

def index(request):
	return render(request, "life/layout.html")

@csrf_exempt
def newSpecies(request):
	if request.method != "POST":
		return JsonResponse({"error": "POST request required."}, status=400)
	incoming = json.loads(request.body)
	c = incoming['content']
	l = incoming['lineage']
	# everything cleaned and vetted on frontend.
	# Meaning:
		# only as many dictionary entries come back that have been filled. If there're only two content data (say 'Canonical Name' and 'Description') only these two will be within 'content', not more. Same for lineage: if there're gaps in the ancestry, like classRank missing, it won't exist in the lineage dictionary.
		# in other words: there're no nulls (JS) / Nones coming in.
	try:
		Species.objects.get(canonicalName__iexact=c['canonicalName'])
		return JsonResponse({"message": "The canonical name "+c['canonicalName']+" already exists in the database!"}, status=200)
	except(Species.DoesNotExist, AttributeError):
		saveLineage(l)
		if saveSpecies(c, l):
			return JsonResponse({"message": "New Species successfully added to database!"}, status=201)				
		
def saveLineage(lineage):
	kingdom = None
	phylym = None
	classRank = None
	order = None
	family = None
	genus = None
	
	# does kingdom first, then goes down the ranks, thus always having a parent ready for the next / lower rank.
	for rank in lineage:
		if (rank == 'kingdom'):
			try:
				kingdom = Kingdom.objects.get(key = lineage[rank]['key'])
			except(Kingdom.DoesNotExist, AttributeError):
				kingdom = Kingdom(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				kingdom.save()
		elif (rank == 'phylum'):
			try:
				phylum = Phylum.objects.get(key = lineage[rank]['key'])
			except(Phylum.DoesNotExist, AttributeError):
				phylum = Phylum(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if kingdom is not None:
					phylum.kingdom = kingdom
				phylum.save()
		elif (rank == 'class'):
			try:
				classRank = ClassRank.objects.get(key = lineage[rank]['key'])
			except(ClassRank.DoesNotExist, AttributeError):
				classRank = ClassRank(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if phylum is not None:
					classRank.phylum = phylum
				classRank.save()
		elif (rank == 'order'):
			try:
				order = Order.objects.get(key = lineage[rank]['key'])
			except(Order.DoesNotExist, AttributeError):
				order = Order(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if classRank is not None:
					order.classRank = classRank
				order.save()
		elif (rank == 'family'):
			try:
				family = Family.objects.get(key = lineage[rank]['key'])
			except(Family.DoesNotExist, AttributeError):
				family = Family(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if order is not None:
					family.order = order
				family.save()
		elif (rank == 'genus'):
			try:
				genus = Genus.objects.get(key = lineage[rank]['key'])
			except(Genus.DoesNotExist, AttributeError):
				genus = Genus(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if family is not None:
					genus.family = family
				genus.save()
				
def saveSpecies(data, lineage):
	species = Species()
	species.canonicalName = data['canonicalName']
	species.theSpecies = data['canonicalName']
	species.rank = 'SPECIES'
	species.synonym = False
	species.taxonomicStatus = 'ACCEPTED'
	species.nameType = 'SCIENTIFIC'
	species.localDjangoDB = True
	
	for taxa in lineage:
		setattr(species, taxa, lineage[taxa]['canonicalName'])
		setattr(species, taxa+'Key', lineage[taxa]['key'])
	
	for x in range(len(JSONHigherTaxa)-1, -1, -1):
		if JSONHigherTaxa[x] in lineage:
			species.parent = lineage[JSONHigherTaxa[x]]['canonicalName']
			species.parentKey = lineage[JSONHigherTaxa[x]]['key']
			break
			
	species.save()
	species.key = species.id
	species.speciesKey = species.id
	species.save()
	
	if 'vernacularNames' in data:
		for name in data['vernacularNames']:
			vernacular = VernacularName(vernacularName = name, species = species, preferred=False, language='eng')
			vernacular.save()
	if 'synonyms' in data:
		for synonym in data['synonyms']:
			syn = SynonymName(canonicalName = synonym, species = species)
			syn.save()
	if 'distributions' in data:
		for place in data['distributions']:
			someplace = Distribution(locality = place, species = species)
			someplace.save()
	if 'description' in data:
		description = Description(description = data['description'], language= 'eng', typeOfDescription = 'description', species = species)
		description.save()
	if 'mediaLinks' in data:
		for link in data['mediaLinks']:
			imgType = None
			for suffix in imageFileTypes:
				if link.endswith(suffix):
					imgType = suffix
			media = SpeciesMedia(species = species, identifier = link, imageType='StillImage')
			if imgType is not None:
				media.imageFormat = 'image/'+imgType
			media.save()
	return True

@csrf_exempt
def newOccurrence(request):
	if request.method != "POST":
		return JsonResponse({"error": "POST request required."}, status=400)
	data = json.loads(request.body)
	occurrence = Occurrence()
	for field in JSONOccurrenceFields:
		if field == 'imageLink':
			continue
		elif field in data:
			setattr(occurrence, field, data[field])
	
	for name in JSONRanks:
		if name not in data:
			continue
		if name == 'species':
			setattr(occurrence, 'theSpecies', data[name])
		elif name == 'class':
			setattr(occurrence, 'classRank', data[name])
		elif name == 'classKey':
			setattr(occurrence, 'classRankKey', data[name])
		else:
			setattr(occurrence, name, data[name])
	
	for key in JSONRanksKeys:
		if key not in data:
			continue
		setattr(occurrence, key, data[key])
	
	if occurrence.theSpecies is not None:
		occurrence.save()
		for link in data['mediaLinks']:
			imgType = None
			for suffix in imageFileTypes:
				if link.endswith(suffix):
					imgType = suffix
			media = OccurrenceMedia(occurrence = occurrence, identifier = link, imageType='StillImage')
			if imgType is not None:
				media.imageFormat = 'image/'+imgType
			media.save()
		return JsonResponse({"message": "New Occurrence successfully added to database!"}, status=201)
	return JsonResponse({"message": "Error. Could not save to DB!"}, status=500)
	
def buildResponseDict(count, offset, limit):
	response = {}
	response['results'] = []
	response['count'] = count
	response['endOfRecords'] = False
	if limit >= count or (offset + limit) >= count:
		response['endOfRecords'] = True
	response['limit'] = limit
	response['offset'] = offset
	response['localDjangoDB'] = True
	return response
			
def buildSpeciesDict(species):
	speciesObject = {}
	for field in speciesFields:
		if getattr(species, field) is not None:
			if field == 'theSpecies':
				speciesObject['species'] = getattr(species, field)
			else:
				speciesObject[field] = getattr(species, field)
	return speciesObject
	
def getOffset(request):
	offset = 0
	if request.GET.get('offset') is not None:
		if request.GET.get('offset').isnumeric():
			offset = int(request.GET.get('offset'))
	return offset
	
def getLimit(request):
	limit = 20
	if request.GET.get('limit') is not None:
		if request.GET.get('limit').isnumeric():
			limit = int(request.GET.get('limit'))
	return limit
	
def getSpecies(key):
	try:
		species = Species.objects.get(id=key)
		return species
	except(Species.DoesNotExist, AttributeError):
		return None
			
def speciesSearch(request):
	offset = getOffset(request)
	limit = getLimit(request)
	q = request.GET.get('q')
	higherTaxonKey = request.GET.get('higherTaxonKey')
	vernacular = request.GET.get('qField')
	
	if q is None and higherTaxonKey is None:
		response = buildResponseDict(0, offset, limit)
		response['message'] = 'No query given.'
		return JsonResponse(response, status=200)
	
	if higherTaxonKey is not None:
		if higherTaxonKey.isnumeric():
			higherTaxonKey = int(higherTaxonKey)
		else:
			higherTaxonKey = higherTaxonKey.lower()
		foundSpecies = getHigherTaxon(higherTaxonKey)
		if foundSpecies is None:
			response = buildResponseDict(0, offset, limit)
			response['message'] = 'No species found within the higher taxon '+str(higherTaxonKey)
			return JsonResponse(response, status=200)
		speciesSelection = []
		for species in foundSpecies:
			speciesSelection.append(buildSpeciesDict(species))
		response = buildResponseDict(len(speciesSelection), offset, limit)
		response['results'] = speciesSelection
		return JsonResponse(response, status = 200)
		
	if vernacular is not None:
		if vernacular.lower() == 'vernacular':
			vernacular = vernacular.lower()
		else:
			vernacular = None
		
	if vernacular == 'vernacular':
		verNames = VernacularName.objects.filter(vernacularName__icontains=q)
		verNamesSpecies = []
		for name in verNames:
			verNamesSpecies.append(buildSpeciesDict(name.species))
		response = buildResponseDict(len(verNamesSpecies), offset, limit)
		response['results'] = verNamesSpecies
		return JsonResponse(response, status = 200);
	
	allSpecies = Species.objects.filter(canonicalName__icontains=q)[offset:offset+limit]
	if len(allSpecies) == 0:
		response = buildResponseDict(0, offset, limit)
		response['message'] = 'Nothing found for query '+q
		return JsonResponse(response, status = 200)
	
	response = buildResponseDict(len(allSpecies), offset, limit)
	
	for species in allSpecies:
		response['results'].append(buildSpeciesDict(species))
	return JsonResponse(response);
	
def speciesQuery(request):
	if request.GET.get('name') is not None:
		name = request.GET.get('name')

		species = None
		try:
			species = Species.objects.get(canonicalName__iexact = name)
		except(Species.DoesNotExist, AttributeError):
			return JsonResponse(buildResponseDict(0,0,20), status=200)

		species = buildSpeciesDict(species)
		response = buildResponseDict(1,0,20)
		response['results'].append(species)
		# It's incomprehensible, but when querying the GBIF with canonical names (api.gbif.org/v1/species?name=...), it'll always send back a response container with the standard data (offset, limit, reachedEnd...) where the sole result is in 'results'. It would make much more sense to just send back the single species, as it happens when you do a key query. Canonical names are unique, that's their very purpose. There'll always be one result, and when doing a 'species?name=...' query, the GBIF does not look for containing strings... so you either get a single object (in 'results'!), or none. But always delivered in a container (unlike in key search). That's why I'm emulating this here, as the front-end already expects this quirky behaviour, and the purpose of the backend is to be simplified version of the GBIF API.
		return JsonResponse(response, status=200)		

def getHigherTaxon(taxon):
	result = None
	rank = 0

	for x in range(len(higherTaxaClasses)):
		try:
			if isinstance(taxon, int):
				result = higherTaxaClasses[x].objects.get(key=taxon)
			else:
				result = higherTaxaClasses[x].objects.get(canonicalName__iexact=taxon)
			rank = x
			break
		except(higherTaxaClasses[x].DoesNotExist, AttributeError):
			pass
			
	if result is not None:
		higherRank = higherTaxa[rank]+'Key'
		result = Species.objects.filter(**{higherRank:result.key})
		""" OR
		higherRank = higherTaxa[rank]
		result = Species.objects.filter(**{higherRank:result.canonicalName})
		"""
	return result
		
def speciesKey(request, key):
	species = None
	try:
		species = Species.objects.get(id=key)
	except(Species.DoesNotExist, AttributeError):
		return JsonResponse({'message': 'Entity not found for uri: /species/'+str(key), 'status':404})
	
	species = buildSpeciesDict(species)
	return JsonResponse(species, status=200)
	
def speciesMedia(request, key):
	offset = getOffset(request)
	limit = getLimit(request)
	species = getSpecies(key)
	if species is None:
		return JsonResponse(buildResponseDict(0, offset, limit))
		
	media = SpeciesMedia.objects.filter(species = species)[offset:offset+limit]
	response = buildResponseDict(len(media), offset, limit)
	
	for image in media:
		response['results'].append({'identifier':image.identifier, 'type': image.imageType, 'format': image.imageFormat})
	return JsonResponse(response, status=200)

def speciesDistributions(request, key):
	offset = getOffset(request)
	limit = getLimit(request)
	species = getSpecies(key)
	if species is None:
		return JsonResponse(buildResponseDict(0, offset, limit))

	places = Distribution.objects.filter(species = species)[offset:offset+limit]
	response = buildResponseDict(len(places), offset, limit)
	
	for place in places:
		response['results'].append({'locality': place.locality})
	return JsonResponse(response, status=200)
	
def speciesSynonyms(request, key):
	offset = getOffset(request)
	limit = getLimit(request)
	species = getSpecies(key)
	if species is None:
		return JsonResponse(buildResponseDict(0, offset, limit))
		
	synonyms = SynonymName.objects.filter(species = species)[offset:offset+limit]
	response = buildResponseDict(len(synonyms), offset, limit)
	
	for synonym in synonyms:
		response['results'].append({'canonicalName': synonym.canonicalName})
	return JsonResponse(response, status=200)
	
def speciesDescriptions(request, key):
	offset = getOffset(request)
	limit = getLimit(request)
	species = getSpecies(key)
	if species is None:
		return JsonResponse(buildResponseDict(0, offset, limit))

	descriptions = Description.objects.filter(species = species)[offset:offset+limit]
	response = buildResponseDict(len(descriptions), offset, limit)
	
	for description in descriptions:
		response['results'].append({'description': description.description, 'type': description.typeOfDescription, 'language': description.language})
	return JsonResponse(response, status=200)
	
def speciesVernacularNames(request, key):
	offset = getOffset(request)
	limit = getLimit(request)
	species = getSpecies(key)
	if species is None:
		return JsonResponse(buildResponseDict(0, offset, limit))
		
	vernaculars = VernacularName.objects.filter(species = species)[offset:offset+limit]
	response = buildResponseDict(len(vernaculars), offset, limit)

	for name in vernaculars:
		ver = {'vernacularName':name.vernacularName, 'preferred':name.preferred, 'language': name.language}
		response['results'].append(ver)
	return JsonResponse(response, status=200)
	
def occurrenceSearch(request):
	offset = getOffset(request)
	limit = getLimit(request)
	speciesKey = None
	if request.GET.get('speciesKey') is not None:
		if request.GET.get('speciesKey').isnumeric():
			speciesKey = int(request.GET.get('speciesKey'))
	if speciesKey is None:
		return JsonResponse(buildResponseDict(offset, limit, 0))
	
	allOccurrences = Occurrence.objects.filter(speciesKey = speciesKey)
	if len(allOccurrences) == 0:
		return JsonResponse(buildResponseDict(offset, limit, 0))
	
	allOcDicts = []
	for each in allOccurrences:
		OcDict = {}
		OcDict['media'] = []
		for field in occurrencesFields:
			if getattr(each, field) is not None:
				OcDict[field] = getattr(each, field)
		for field in allRanks:
			if getattr(each, field) is not None:
				if field == 'theSpecies':
					OcDict['species'] = getattr(each, 'theSpecies')
				elif field == 'classRank':
					OcDict['class'] = getattr(each, 'classRank')
				elif field == 'classRankKey':
					OcDict['classKey'] = getattr(each, 'classRankKey')
				else:
					OcDict[field] = getattr(each, field)
		mediaObjects = OccurrenceMedia.objects.filter(occurrence = each)
		
		for every in mediaObjects:
			newMedia = {'identifier': every.identifier, 'format': every.imageFormat, 'type': every.imageType}
			if getattr(each, 'recordedBy') is not None:
				newMedia['rightsHolder'] = getattr(each, 'recordedBy')
			OcDict['media'].append(newMedia)
		
		if 'decimalLatitude' in OcDict:
			OcDict['decimalLatitude'] = noTrailingNaughts(OcDict['decimalLatitude'])
		if 'decimalLongitude' in OcDict:
			OcDict['decimalLongitude'] = noTrailingNaughts(OcDict['decimalLongitude'])
				
		allOcDicts.append(OcDict)
		
	response = buildResponseDict(len(allOcDicts), offset, limit)
	response['results'] = allOcDicts	
	return JsonResponse(response, status=200)

def noTrailingNaughts(num): # cutting of trailing zeros which are generated in the model to fill the max_digits memory allocation
# of course I first looked for a standard library solution and then on stackoverflow; there were many suggestions but with unsatisfying results (like cutting off far-off digits from 3.000000300 and such (returning 3.0), and that was the chosen answer on stackoverflow. So I just wrote my own quickly, which is perfectly reliable:
# While a double conversion from float to string and back may not be the most performant solution, it may be the only solution, because cutting off trailing zeros is a matter of how to visually present the SAME number (3.003 == 3.00300), so using functions that deal with it as numbers only may not work. Here I turn it into a string, which is an array, then go backwards through it until it finds a non-naught, and grabs the string from the beginning unto then. The new string then back to a float, and then a simple check whether it can get turned into an integer without loss: 3.0 > 3 == False, so can become int. 3.9 > 3 == True, stays float.
	toStr = str(num)
	for x in range(len(toStr)-1,-1,-1):
		if toStr[x] != '0':
			backToNum = float(toStr[0:x+1])
			if backToNum > int(backToNum):
				return backToNum
			return int(backToNum)
				
#DEBUG
def showDatabase():
	allSpecies = Species.objects.all()
	allVernacular = VernacularName.objects.all()
	allSynonyms = SynonymName.objects.all()
	allPlaces = Distribution.objects.all()
	allMedia = SpeciesMedia.objects.all()
	allOccurrences = Occurrence.objects.all()
	allOccurrencesMedia = OccurrenceMedia.objects.all()
	print('\nCANONICAL NAMES: \n')
	for species in allSpecies:
		for field in speciesFields:
			print(getattr(species, field))
		for field in allRanks:
			print(getattr(species, field))
	print('\nVERNACULAR NAMES: \n')
	for name in allVernacular:
		print(name.vernacularName)
	print('\nSYNONYMS: \n')
	for syn in allSynonyms:
		print(syn.canonicalName)
	print('\nDISTRIBUTION: \n')
	for place in allPlaces:
		print(place.locality)
	for link in allMedia:
		print(link.identifier)
	print('\nOCCURRENCES: \n')
	for o in allOccurrences:
		for field in occurrencesFields:
			print(getattr(o, field))
		for field in allRanks:
			print(getattr(o, field))
	for m in allOccurrencesMedia:
		print(m.identifier)
#showDatabase()