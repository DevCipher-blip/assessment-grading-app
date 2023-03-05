from django.db import migrations, models


def clear_placeholder_scores(apps, schema_editor):
    """The browser used to post score 0 with no evaluator; that was never a real score."""
    Quiz = apps.get_model("quiz", "Quiz")
    Quiz.objects.filter(score=0, evaluated_by="").update(score=None)


class Migration(migrations.Migration):
    dependencies = [
        ("quiz", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="quiz",
            name="score",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="quiz",
            name="submitted_by",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.AlterField(
            model_name="quiz",
            name="evaluated_by",
            field=models.CharField(blank=True, default="", max_length=150),
        ),
        migrations.RunPython(clear_placeholder_scores, migrations.RunPython.noop),
    ]
