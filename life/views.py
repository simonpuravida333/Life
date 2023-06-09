from django.shortcuts import render, redirect
#from .forms import AddSpecies

# Create your views here.
def index(request):
	return render(request, "life/index.html")

