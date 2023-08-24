from django.contrib import admin
from django.urls import path
from . import views

app_name = 'life'

urlpatterns = [
    path('', views.index, name="index"),
    path('index', views.index, name="index"),
    path('home', views.index, name="index"),
    path('newSpecies', views.newSpecies, name="newSpecies"),
    path('search', views.search, name="search"),
    path('species', views.speciesQuery, name="speciesQuery"),
    path('species/<int:key>', views.speciesKey, name="speciesKey"),
    path('species/<int:key>/media', views.speciesMedia, name="speciesMedia"),
    path('species/<int:key>/distributions', views.speciesDistributions, name="speciesDistributions"),
    path('species/<int:key>/synonyms', views.speciesSynonyms, name="speciesSynonyms"),
    path('species/<int:key>/descriptions', views.speciesDescriptions, name="speciesDescriptions"),
    path('species/<int:key>/vernacularNames', views.speciesVernacularNames, name="speciesVernacularNames")
]