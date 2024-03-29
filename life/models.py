from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

basisOfRecord = [
	('Living Speciem', 'Living Speciem'),
	('Preserved Specimen', 'Preserved Specimen'),
	('Fossil Specimen', 'Fossil Specimen'),
	('Material Citation', 'Material Citation'),
	('Human Observation', 'Human Observation'),
	('Machine Observation', 'Machine Observation')
]

iucnRedListCategory = [
	('NE', 'Not evaluated'),
	('DD', 'Data deficient'),
	('LC', 'Least concern'),
	('NT', 'Near threatened'),
	('VU', 'Vulnerable'),
	('EN', 'Endangered'),
	('CR', 'Critically endangered'),
	('EX', 'Extinct'),
	('EW', 'Extinct in the wild')
]

status = [
	('ACCEPTED','ACCEPTED'),
	('DOUBTFUL','DOUBTFUL'),
	('HETEROTYPIC SYNONYM','HETEROTYPIC SYNONYM'),
	('HOMOTYPIC SYNONYM','HOMOTYPIC SYNONYM'),
	('MISAPPLIED','MISAPPLIED'),
	('PROPARTE SYNONYM','PROPARTE SYNONYM'),
	('SYNONYM','SYNONYM')
]

nameType = [
	('BLACKLISTED', 'BLACKLISTED'),
	('CANDIDATUS', 'CANDIDATUS'),
	('CULTIVAR', 'CULTIVAR'),
	('DOUBTFUL', 'DOUBTFUL'),
	('HYBRID', 'HYBRID'),
	('INFORMAL', 'INFORMAL'),
	('NO_NAME', 'NO_NAME'),
	('OTU', 'OTU'),
	('PLACEHOLDER', 'PLACEHOLDER'),
	('SCIENTIFIC', 'SCIENTIFIC'),
	('VIRUS', 'VIRUS')
]

establishmentMeans = [
	('INTRODUCED', 'INTRODUCED' ),
	('INVASIVE', 'INVASIVE' ),
	('MANAGED', 'MANAGED' ),
	('NATIVE', 'NATIVE' ),
	('NATURALISED', 'NATURALISED' ),
	('UNCERTAIN', 'UNCERTAIN' ),
]

# TAXONOMY RANKS
# every rank stands for itself. There is not an enforced tree-hierarchy; relating to parents is optional. This is a mock-up DB simulating the taxonomy tree. On the GBIF there are sometimes no direct parents or children, there're also UNRANKED entries.

class Kingdom(models.Model):
	key = models.IntegerField()
	canonicalName = models.CharField(max_length = 32)
	
class Phylum(models.Model):
	key = models.IntegerField()
	kingdom = models.ForeignKey(Kingdom, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class ClassRank(models.Model):
	key = models.IntegerField()
	phylum = models.ForeignKey(Phylum, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class Order(models.Model):
	key = models.IntegerField()
	classRank = models.ForeignKey(ClassRank, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class Family(models.Model):
	key = models.IntegerField()
	order = models.ForeignKey(Order, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class Genus(models.Model):
	key = models.IntegerField()
	family = models.ForeignKey(Family, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)

class AllRanks(models.Model):
	kingdom = models.CharField(max_length=256, null = True)
	phylum = models.CharField(max_length=256, null = True)
	classRank = models.CharField(max_length=256, null = True)
	order = models.CharField(max_length=256, null = True)
	family = models.CharField(max_length=256, null = True)
	genus = models.CharField(max_length=256, null = True)
	theSpecies = models.CharField(max_length=256) # just using 'species' will cause a name-clash with inherited class 'Species'
	kingdomKey = models.IntegerField(null = True)
	phylumKey = models.IntegerField(null = True)
	classRankKey = models.IntegerField(null = True)
	orderKey = models.IntegerField(null = True)
	familyKey = models.IntegerField(null = True)
	genusKey = models.IntegerField(null = True)
	speciesKey = models.IntegerField(null = True)

class Species(AllRanks):
	# to create a species, a user will only have to know either a canonical name or at least one vernacular name.
	canonicalName = models.CharField(max_length=256)
		
	key = models.IntegerField(null = True)
	# let's stay in true GBIF fashion and have an actual key (despite it also being the id in Species objects). It is null=True because I first have to create the Species object, before I can set key = id. Otherwise it'd throw a non-nullable field error.
	rank = models.CharField(max_length = 32)
	taxonomicStatus = models.CharField(max_length = 32, choices = status)
	nameType = models.CharField(max_length = 32, choices = nameType)
	
	#PARENTS: doesn't need all ranks, it can directly refer it to ranks higher than Genus.
	parent = models.CharField(max_length=256, null = True)
	parentKey = models.IntegerField(null = True)

	localDjangoDB = models.BooleanField()

class SpeciesMedia(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	identifier = models.URLField()
	imageFormat = models.CharField(max_length=32, null=True)
	imageType = models.CharField(max_length=32, null=True)
	
class SynonymName(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	canonicalName = models.CharField(max_length = 256)
	#synonym should actually inherit from the species class, as it is a part in the taxonomy tree, with all the scientific descriptions. But for simplicity in this app, let's just keep it with the name only. Or I would have to set up a complete frontend forms for synonyms only, which would miss the focus of this app.

class Distribution(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	locality = models.TextField(max_length = 2048)
	
class VernacularName(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	vernacularName = models.CharField(max_length = 256)
	language = models.CharField(max_length = 3, null=True)
	preferred = models.BooleanField()
	
class Description(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	description = models.TextField(max_length = pow(2,20))
	typeOfDescription = models.CharField(max_length = 32)
	language = models.CharField(max_length = 3, null=True)

# Occurrences must be linked to a species, no other rank.
class Occurrence(AllRanks):
	waterBody = models.CharField(max_length= 128, null = True)
	continent = models.CharField(max_length=64, null = True)
	country = models.CharField(max_length=128, null = True)
	countryCode = models.CharField(max_length=3, null = True)
	locality = models.CharField(max_length=512, null = True)
	elevation = models.IntegerField(null = True)
	depth = models.IntegerField(null = True)

	decimalLatitude = models.DecimalField(max_digits=11, decimal_places=8, null = True)
	decimalLongitude = models.DecimalField(max_digits=11, decimal_places=8, null = True)
	
	basisOfRecord = models.CharField(max_length=64, null = True, choices=basisOfRecord)
	identifiedBy = models.CharField(max_length=256, null = True)
	recordedBy = models.CharField(max_length=256, null = True)
	isInCluster = models.BooleanField(null = True)
	individualCount = models.IntegerField(null = True)
	sex = models.CharField(max_length=8, null = True)
	identificationRemarks = models.CharField(max_length = 256, null=True)
	establishmentMeans = models.CharField(max_length=16, choices= establishmentMeans, null = True)
	iucnRedListCategory = models.CharField(max_length=2, choices=iucnRedListCategory, null = True)

	eventTime = models.CharField(max_length=8, null = True) #hh:mm:ss
	day = models.IntegerField(null = True)
	month = models.IntegerField(null = True)
	year = models.IntegerField(null = True)
	
class OccurrenceMedia(models.Model):
	occurrence = models.ForeignKey(Occurrence, on_delete = models.CASCADE)
	identifier = models.URLField()
	imageFormat = models.CharField(max_length=32, null=True)
	imageType = models.CharField(max_length=32, null=True)