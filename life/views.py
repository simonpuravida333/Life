import json
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
#from .forms import AddSpecies

# Create your views here.
def index(request):
	return render(request, "life/layout.html")

@csrf_exempt	
def newSpecies(request):
	if request.method != "POST":
		return JsonResponse({"error": "POST request required."}, status=400)
	incoming = json.loads(request.body)
	c = incoming.content
	newSpecies = Species(canonicalName = c.canonicalName, vernacularNames = c.vernacularNames, synonyms = c.synonyms, distribution = c.distribution, description = c.description)
	newLineage(incoming.lineage);
	return JsonResponse({"message": "New Species successfully added to database!"}, status=201)	
		
def newLineage(l):
	pass