# Generated by Django 2.0.7 on 2018-08-07 20:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('groupride', '0013_auto_20180807_0648'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='rating',
            field=models.CharField(blank=True, choices=[('1', 'Entire route is not recommended and possibly dangerous.'), ('2', 'Sections of route are not recommended.'), ('3', 'Generally accepable. Nothing Special, but safe.'), ('4', 'Good. Recommended'), ('5', 'Outstanding!')], default=None, max_length=1),
        ),
    ]
