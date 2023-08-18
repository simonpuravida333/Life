from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
	pass

# the kingdoms on the GBIF
kingdoms = [
	('Animalia','Animalia'),
	('Archaea','Archaea'),
	('Bacteria','Bacteria'),
	('Chromista','Chromista'),
	('Fungi','Fungi'),
	('Plantae','Plantae'),
	('Protozoa','Protozoa'),
	('Viruses','Viruses'),
]

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

# TAXONOMY RANKS
# every rank stands for itself. There is not an enforced tree-hierarchy; relating to parents is optional. This is a mock-up DB simulating the taxonomy tree. On the GBIF there are sometimes no direct parents or children, there're also UNRANKED entries.

class GBIFKey(models.Model):
	key = models.IntegerField()

class Kingdom(models.Model):
	key = models.OneToOneField(GBIFKey, on_delete=models.CASCADE, primary_key=True)
	canonicalName = models.CharField(max_length = 64, choices=kingdoms)
	
class Phylum(models.Model):
	key = models.OneToOneField(GBIFKey, on_delete=models.CASCADE, primary_key=True)
	kingdom = models.ForeignKey(Kingdom, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class ClassRank(models.Model):
	key = models.OneToOneField(GBIFKey, on_delete=models.CASCADE, primary_key=True)
	phylum = models.ForeignKey(Phylum, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class Order(models.Model):
	key = models.OneToOneField(GBIFKey, on_delete=models.CASCADE, primary_key=True)
	classRank = models.ForeignKey(ClassRank, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class Family(models.Model):
	key = models.OneToOneField(GBIFKey, on_delete=models.CASCADE, primary_key=True)
	order = models.ForeignKey(Order, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	
class Genus(models.Model):
	key = models.OneToOneField(GBIFKey, on_delete=models.CASCADE, primary_key=True)
	family = models.ForeignKey(Family, null=True, on_delete = models.PROTECT)
	canonicalName = models.CharField(max_length = 256)
	

class Species(models.Model):
	# to create a species, a user will only have to know either a canonical name or at least one vernacular name.
	canonicalName = models.CharField(max_length=256, null = True)
	vernacularNames = models.CharField(max_length = 1024, null = True)
	synonyms = models.CharField(max_length = 1024, null = True)
	distribution = models.TextField(max_length = 8192, null = True)
	description = models.TextField(max_length = pow(2,20), null = True)
	
	#PARENTS: user doesn't need to know every parent, they can directly refer it to ranks higher than Genus. That is if the user doesn't know some ranks (maybe only knows that it is a mammal), and also for the case that there is no particular rank fitting within the 7 GBIF ranks.
	kingdom = models.ForeignKey(Kingdom, null = True, on_delete=models.PROTECT)
	phylum = models.ForeignKey(Phylum, null = True, on_delete=models.PROTECT)
	classRank = models.ForeignKey(ClassRank, null = True, on_delete=models.PROTECT)
	order = models.ForeignKey(Order, null = True, on_delete=models.PROTECT)
	family = models.ForeignKey(Family, null = True, on_delete=models.PROTECT)
	genus = models.ForeignKey(Genus, null = True, on_delete=models.PROTECT)

# Occurrences must be linked to a species, no other rank.
class Occurrence(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	basisOfRecord = models.CharField(max_length=64, blank = True, choices=basisOfRecord)
	identifiedBy = models.CharField(max_length=256, blank = True)
	recordedBy = models.CharField(max_length=256, blank = True)
	isInCluster = models.BooleanField()
		
	iucnRedListCategory = models.CharField(max_length=2, choices=iucnRedListCategory)
	eventDate = models.CharField(max_length=19, blank = True) #yyyy-mm-ddThh:mm:ss
	
	continent = models.CharField(max_length=64, blank = True)
	country = models.CharField(max_length=128, blank = True)
	countryCode = models.CharField(max_length=3, blank = True)
	locality = models.CharField(max_length=512, blank = True)
	decimalLatitude = models.DecimalField(max_digits=11, decimal_places=8, blank = True)
	decimalLongitude = models.DecimalField(max_digits=11, decimal_places=8, blank = True)
	elevation = models.DecimalField(max_digits=8, decimal_places=4, blank = True)
	
class OccurrenceMedia(models.Model):
	occurrence = models.ForeignKey(Occurrence, on_delete = models.CASCADE)
	imageLink = models.URLField()

class SpeciesMedia(models.Model):
	species = models.ForeignKey(Species, on_delete = models.CASCADE)
	imageLink = models.URLField()