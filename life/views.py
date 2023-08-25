import json
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize

from .models import Kingdom, Phylum, ClassRank, Order, Family, Genus, Species, SpeciesMedia, SynonymName, Distribution, VernacularName, Description

# caution: mind the difference of 'class' and 'classRank' between JSON strings and code (on both stack-ends)
higherTaxaClasses = [Kingdom, Phylum, ClassRank, Order, Family, Genus]
higherTaxa = ['kingdom', 'phylum', 'classRank', 'order', 'family', 'genus']
speciesFields = ['canonicalName', 'species', 'key', 'speciesKey', 'nubKey', 'rank', 'synonym', 'taxonomicStatus', 'nameType', 'parent', 'parentKey', 'kingdom', 'phylum', 'classRank', 'order', 'family', 'genus', 'kingdomKey', 'phylumKey', 'classRankKey', 'orderKey', 'familyKey', 'genusKey', 'localDjangoDB']
JSONFields = ['canonicalName', 'vernacularNames', 'synonyms', 'distributions', 'description', 'mediaLinks']
JSONRanks = ["kingdom", "phylum", "class", "order", "family", "genus"]
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
				print('already exists')
			except(Kingdom.DoesNotExist, AttributeError):
				kingdom = Kingdom(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				kingdom.save()
				print('saved to DB')
		elif (rank == 'phylum'):
			try:
				phylum = Phylum.objects.get(key = lineage[rank]['key'])
				print('already exists')
			except(Phylum.DoesNotExist, AttributeError):
				phylum = Phylum(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if kingdom is not None:
					phylum.kingdom = kingdom
				phylum.save()
				print('saved to DB')
		elif (rank == 'class'):
			try:
				classRank = ClassRank.objects.get(key = lineage[rank]['key'])
				print('already exists')
			except(ClassRank.DoesNotExist, AttributeError):
				classRank = ClassRank(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if phylum is not None:
					classRank.phylum = phylum
				classRank.save()
				print('saved to DB')
		elif (rank == 'order'):
			try:
				order = Order.objects.get(key = lineage[rank]['key'])
				print('already exists')
			except(Order.DoesNotExist, AttributeError):
				order = Order(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if classRank is not None:
					order.classRank = classRank
				order.save()
				print('saved to DB')
		elif (rank == 'family'):
			try:
				family = Family.objects.get(key = lineage[rank]['key'])
				print('already exists')
			except(Family.DoesNotExist, AttributeError):
				family = Family(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				if order is not None:
					family.order = order
				family.save()
				print('saved to DB')
		elif (rank == 'genus'):
			try:
				genus = Genus.objects.get(key = lineage[rank]['key'])
				print('already exists')
			except(Genus.DoesNotExist, AttributeError):
				genus = Genus(key = lineage[rank]['key'], canonicalName = lineage[rank]['canonicalName'])
				"""
				if family is not None:
					genus.family = family
				"""
				genus.save()
				print('saved to DB')
				
def saveSpecies(data, lineage):
	species = Species()
	species.canonicalName = data['canonicalName']
	species.species = data['canonicalName']
	species.rank = 'SPECIES'
	species.synonym = False
	species.taxonomicStatus = 'ACCEPTED'
	species.nameType = 'SCIENTIFIC'
	species.localDjangoDB = True
	
	for taxa in lineage:
		setattr(species, taxa, lineage[taxa]['canonicalName'])
		setattr(species, taxa+'Key', lineage[taxa]['key'])
	
	for x in range(len(JSONRanks)-1, -1, -1):
		if JSONRanks[x] in lineage:
			species.parent = lineage[JSONRanks[x]]['canonicalName']
			species.parentKey = lineage[JSONRanks[x]]['key']
			break
			
	species.save()
	species.key = species.id
	species.speciesKey = species.id
	species.nubKey = species.id
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
	species = None
	try:
		species = Species.objects.get(id=key)
	except(Species.DoesNotExist, AttributeError):
		pass
	return species
			
def search(request):
	offset = getOffset(request)
	limit = getLimit(request)
	q = request.GET.get('q')
	higherTaxonKey = request.GET.get('higherTaxonKey')
	vernacular = request.GET.get('qField')
	
	if q is None and higherTaxonKey is None:
		return JsonResponse({'message': 'No query given.'})
	
	if higherTaxonKey is not None:
		if higherTaxonKey.isnumeric():
			higherTaxonKey = int(higherTaxonKey)
		else:
			higherTaxonKey = higherTaxonKey.lower()
		foundSpecies = getHigherTaxon(higherTaxonKey)
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
		return JsonResponse({'message': 'Nothing found for query '+q})
	
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
		# It's incomprehensible, but when querying the GBIF with canonical names (api.gbif.org/v1/species?name=...), it'll always send back a response container with the standard data (offset, limit, reachedEnd...) where the sole result is in 'results'. It would make much more sense to just send back the single species, as it happens when you do a key query. Canonical names are unique, that's their very purpose. There'll always be one find, and when doing a 'species?name=...' query, the GBIF does not look for containing strings... so you either get a single object (in 'results'!), or none. But always delivered in a container (unlike in key search). That's why I have to emulate this here, as the front-end already expects this quirky behaviour, and the purpose of the backend is to be simplified version of the GBIF API.
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
		return JsonResponse({'message': 'Species key '+str(key)+' does not exist.'})
	
	species = buildSpeciesDict(species)
	return JsonResponse(species, status=200)
	
def speciesMedia(request, key):
	offset = getOffset(request)
	limit = getLimit(request)
	species = getSpecies(key)
	if species is None:
		return JsonResponse({'message': 'Species key '+str(key)+' does not exist.'})
		
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
		return JsonResponse({'message': 'Species key '+str(key)+' does not exist.'})

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
		return JsonResponse({'message': 'Species key '+str(key)+' does not exist.'})
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
		return JsonResponse({'message': 'Species key '+str(key)+' does not exist.'})

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
		return JsonResponse({'message': 'Species key '+str(key)+' does not exist.'})
		
	vernaculars = VernacularName.objects.filter(species = species)[offset:offset+limit]
	response = buildResponseDict(len(vernaculars), offset, limit)

	for name in vernaculars:
		ver = {'vernacularName':name.vernacularName, 'preferred':name.preferred, 'language': name.language}
		response['results'].append(ver)
	return JsonResponse(response, status=200)
	
#DEBUG
def showDatabase():
	allSpecies = Species.objects.all()
	allVernacular = VernacularName.objects.all()
	allSynonyms = SynonymName.objects.all()
	allPlaces = Distribution.objects.all()
	print('\nCANONICAL NAMES: \n')
	for species in allSpecies:
		for field in speciesFields:
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
#showDatabase()