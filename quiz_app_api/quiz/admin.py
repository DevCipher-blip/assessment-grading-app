from django.contrib import admin

from quiz.models import Question, Quiz, QuizAnswer

admin.site.register([Question, QuizAnswer, Quiz])
