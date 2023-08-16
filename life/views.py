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
	print(incoming)
	return JsonResponse({"message": "New Species successfully added to database!"}, status=201)