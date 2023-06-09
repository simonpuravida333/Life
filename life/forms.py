from django import forms
#from .models import Species
from django.forms import ModelForm

"""
class AddSpecies (ModelForm):
	class Meta:
		model = Species
		fields = '__all__'	
		exclude = {
			'name',
		}
		
		
		def __init__(self, *args, **kwargs):
			super(CreateForm, self).__init__(*args, **kwargs)
			for field in self.fields.values():
				field.required = False
"""