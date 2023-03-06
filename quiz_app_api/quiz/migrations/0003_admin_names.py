from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("quiz", "0002_unscored_submissions"),
    ]

    operations = [
        migrations.AlterModelOptions(name="quiz", options={"verbose_name": "submission"}),
        migrations.AlterModelOptions(name="quizanswer", options={"verbose_name": "answer"}),
    ]
