from django.contrib import admin
from django.urls import path
from . import views

app_name = 'life'

urlpatterns = [
    path('', views.index, name="index"),
    path('index', views.index, name="index"),
    path('home', views.index, name="index"),
    path('species', views.speciesQuery, name="speciesQuery"), # expects full canonical name, ignoring upper/lower cases
    path('species/newAddition', views.newSpecies, name="newSpecies"),
    path('species/search', views.speciesSearch, name="speciesSearch"), # search for containing string with multiple, optional parameters
    path('species/<int:key>', views.speciesKey, name="speciesKey"), # expects species key
    path('species/<int:key>/media', views.speciesMedia, name="speciesMedia"),
    path('species/<int:key>/distributions', views.speciesDistributions, name="speciesDistributions"),
    path('species/<int:key>/synonyms', views.speciesSynonyms, name="speciesSynonyms"),
    path('species/<int:key>/descriptions', views.speciesDescriptions, name="speciesDescriptions"),
    path('species/<int:key>/vernacularNames', views.speciesVernacularNames, name="speciesVernacularNames"),
    path('occurrence/newAddition', views.newOccurrence, name="newOccurrence"),
    path('occurrence/search', views.occurrenceSearch, name="occurrenceSearch"),
]