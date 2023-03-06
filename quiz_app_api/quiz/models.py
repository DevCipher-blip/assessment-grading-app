from django.db import models


class Question(models.Model):
    question_text = models.TextField(max_length=500, unique=True)
    answer_text = models.TextField(max_length=800)

    def __str__(self):
        return self.question_text[:80]


class QuizAnswer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    submitted_answer = models.TextField(max_length=800)

    class Meta:
        verbose_name = "answer"

    def __str__(self):
        return f"Answer {self.id} to question {self.question_id}"


class Quiz(models.Model):
    question_response = models.ManyToManyField(QuizAnswer, blank=True)
    submitted_by = models.CharField(max_length=150, blank=True, default="")
    evaluated_by = models.CharField(max_length=150, blank=True, default="")
    # NULL means nobody has scored the submission yet; 0 is a real score.
    score = models.IntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "submission"

    def __str__(self):
        return f"Submission {self.id}"
