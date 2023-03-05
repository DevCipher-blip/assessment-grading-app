from django.urls import path

from quiz.views import SubmitQuizApiView

urlpatterns = [
    path("", SubmitQuizApiView.as_view(), name="submit_quiz"),
]
