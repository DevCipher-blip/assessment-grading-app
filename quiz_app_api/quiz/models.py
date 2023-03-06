from django.db import models


class Question(models.Model):
    question_text = models.TextField(max_length=500, unique=True)
    answer_text = models.TextField(max_length=800)

    def __str__(self):
        return str(self.id)


class QuizAnswer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    submitted_answer = models.TextField(max_length=800)

    def __str__(self):
        return str(self.id)


class Quiz(models.Model):
    question_response = models.ManyToManyField(QuizAnswer, blank=True)
    submitted_by = models.CharField(max_length=150)
    evaluated_by = models.CharField(max_length=150)
    score = models.IntegerField()

    def __str__(self):
        return str(self.id)
