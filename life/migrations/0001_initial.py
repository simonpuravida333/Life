# Generated by Django 4.1.7 on 2023-09-24 19:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AllRanks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kingdom', models.CharField(max_length=256, null=True)),
                ('phylum', models.CharField(max_length=256, null=True)),
                ('classRank', models.CharField(max_length=256, null=True)),
                ('order', models.CharField(max_length=256, null=True)),
                ('family', models.CharField(max_length=256, null=True)),
                ('genus', models.CharField(max_length=256, null=True)),
                ('theSpecies', models.CharField(max_length=256)),
                ('kingdomKey', models.IntegerField(null=True)),
                ('phylumKey', models.IntegerField(null=True)),
                ('classRankKey', models.IntegerField(null=True)),
                ('orderKey', models.IntegerField(null=True)),
                ('familyKey', models.IntegerField(null=True)),
                ('genusKey', models.IntegerField(null=True)),
                ('speciesKey', models.IntegerField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ClassRank',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.IntegerField()),
                ('canonicalName', models.CharField(max_length=256)),
            ],
        ),
        migrations.CreateModel(
            name='Family',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.IntegerField()),
                ('canonicalName', models.CharField(max_length=256)),
            ],
        ),
        migrations.CreateModel(
            name='Kingdom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.IntegerField()),
                ('canonicalName', models.CharField(max_length=32)),
            ],
        ),
        migrations.CreateModel(
            name='Occurrence',
            fields=[
                ('allranks_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='life.allranks')),
                ('waterBody', models.CharField(max_length=128, null=True)),
                ('continent', models.CharField(max_length=64, null=True)),
                ('country', models.CharField(max_length=128, null=True)),
                ('countryCode', models.CharField(max_length=3, null=True)),
                ('locality', models.CharField(max_length=512, null=True)),
                ('elevation', models.IntegerField(null=True)),
                ('depth', models.IntegerField(null=True)),
                ('decimalLatitude', models.DecimalField(decimal_places=8, max_digits=11, null=True)),
                ('decimalLongitude', models.DecimalField(decimal_places=8, max_digits=11, null=True)),
                ('basisOfRecord', models.CharField(choices=[('Living Speciem', 'Living Speciem'), ('Preserved Specimen', 'Preserved Specimen'), ('Fossil Specimen', 'Fossil Specimen'), ('Material Citation', 'Material Citation'), ('Human Observation', 'Human Observation'), ('Machine Observation', 'Machine Observation')], max_length=64, null=True)),
                ('identifiedBy', models.CharField(max_length=256, null=True)),
                ('recordedBy', models.CharField(max_length=256, null=True)),
                ('isInCluster', models.BooleanField(null=True)),
                ('individualCount', models.IntegerField(null=True)),
                ('sex', models.CharField(max_length=8, null=True)),
                ('identificationRemarks', models.CharField(max_length=256, null=True)),
                ('establishmentMeans', models.CharField(choices=[('INTRODUCED', 'INTRODUCED'), ('INVASIVE', 'INVASIVE'), ('MANAGED', 'MANAGED'), ('NATIVE', 'NATIVE'), ('NATURALISED', 'NATURALISED'), ('UNCERTAIN', 'UNCERTAIN')], max_length=16, null=True)),
                ('iucnRedListCategory', models.CharField(choices=[('NE', 'Not evaluated'), ('DD', 'Data deficient'), ('LC', 'Least concern'), ('NT', 'Near threatened'), ('VU', 'Vulnerable'), ('EN', 'Endangered'), ('CR', 'Critically endangered'), ('EX', 'Extinct'), ('EW', 'Extinct in the wild')], max_length=2, null=True)),
                ('eventTime', models.CharField(max_length=8, null=True)),
                ('day', models.IntegerField(null=True)),
                ('month', models.IntegerField(null=True)),
                ('year', models.IntegerField(null=True)),
            ],
            bases=('life.allranks',),
        ),
        migrations.CreateModel(
            name='Species',
            fields=[
                ('allranks_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='life.allranks')),
                ('canonicalName', models.CharField(max_length=256)),
                ('key', models.IntegerField(null=True)),
                ('rank', models.CharField(max_length=32)),
                ('taxonomicStatus', models.CharField(choices=[('ACCEPTED', 'ACCEPTED'), ('DOUBTFUL', 'DOUBTFUL'), ('HETEROTYPIC SYNONYM', 'HETEROTYPIC SYNONYM'), ('HOMOTYPIC SYNONYM', 'HOMOTYPIC SYNONYM'), ('MISAPPLIED', 'MISAPPLIED'), ('PROPARTE SYNONYM', 'PROPARTE SYNONYM'), ('SYNONYM', 'SYNONYM')], max_length=32)),
                ('nameType', models.CharField(choices=[('BLACKLISTED', 'BLACKLISTED'), ('CANDIDATUS', 'CANDIDATUS'), ('CULTIVAR', 'CULTIVAR'), ('DOUBTFUL', 'DOUBTFUL'), ('HYBRID', 'HYBRID'), ('INFORMAL', 'INFORMAL'), ('NO_NAME', 'NO_NAME'), ('OTU', 'OTU'), ('PLACEHOLDER', 'PLACEHOLDER'), ('SCIENTIFIC', 'SCIENTIFIC'), ('VIRUS', 'VIRUS')], max_length=32)),
                ('parent', models.CharField(max_length=256, null=True)),
                ('parentKey', models.IntegerField(null=True)),
                ('localDjangoDB', models.BooleanField()),
            ],
            bases=('life.allranks',),
        ),
        migrations.CreateModel(
            name='Phylum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.IntegerField()),
                ('canonicalName', models.CharField(max_length=256)),
                ('kingdom', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='life.kingdom')),
            ],
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.IntegerField()),
                ('canonicalName', models.CharField(max_length=256)),
                ('classRank', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='life.classrank')),
            ],
        ),
        migrations.CreateModel(
            name='Genus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.IntegerField()),
                ('canonicalName', models.CharField(max_length=256)),
                ('family', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='life.family')),
            ],
        ),
        migrations.AddField(
            model_name='family',
            name='order',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='life.order'),
        ),
        migrations.AddField(
            model_name='classrank',
            name='phylum',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='life.phylum'),
        ),
        migrations.CreateModel(
            name='VernacularName',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vernacularName', models.CharField(max_length=256)),
                ('language', models.CharField(max_length=3, null=True)),
                ('preferred', models.BooleanField()),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='life.species')),
            ],
        ),
        migrations.CreateModel(
            name='SynonymName',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('canonicalName', models.CharField(max_length=256)),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='life.species')),
            ],
        ),
        migrations.CreateModel(
            name='SpeciesMedia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.URLField()),
                ('imageFormat', models.CharField(max_length=32, null=True)),
                ('imageType', models.CharField(max_length=32, null=True)),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='life.species')),
            ],
        ),
        migrations.CreateModel(
            name='OccurrenceMedia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.URLField()),
                ('imageFormat', models.CharField(max_length=32, null=True)),
                ('imageType', models.CharField(max_length=32, null=True)),
                ('occurrence', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='life.occurrence')),
            ],
        ),
        migrations.CreateModel(
            name='Distribution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('locality', models.TextField(max_length=2048)),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='life.species')),
            ],
        ),
        migrations.CreateModel(
            name='Description',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField(max_length=1048576)),
                ('typeOfDescription', models.CharField(max_length=32)),
                ('language', models.CharField(max_length=3, null=True)),
                ('species', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='life.species')),
            ],
        ),
    ]
