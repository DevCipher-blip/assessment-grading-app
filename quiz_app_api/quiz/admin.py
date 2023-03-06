from django.contrib import admin

from quiz.models import *

myModels = [Question, QuizAnswer, Quiz]
admin.site.register(myModels)
