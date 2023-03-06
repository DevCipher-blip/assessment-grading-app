from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from quiz.models import Question, Quiz, QuizAnswer


class SubmitQuizApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("submit_quiz")
        self.valid_payload = {
            "submittedBy": "candidate-1",
            "evaluatedBy": "evaluator-1",
            "score": 3,
            "question": [
                {"questionText": "What is Python?", "answerText": "A language"},
                {"questionText": "What is Django?", "answerText": "A framework"},
            ],
        }

    def test_submit_quiz_accepts_plain_payload(self):
        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["msg"], "Quiz response saved successfully")
        self.assertEqual(Quiz.objects.count(), 1)
        self.assertEqual(QuizAnswer.objects.count(), 2)
        self.assertEqual(Question.objects.count(), 2)

    def test_submit_quiz_accepts_data_wrapped_payload(self):
        response = self.client.post(self.url, {"data": self.valid_payload}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Quiz.objects.count(), 1)

    def test_submit_quiz_rejects_missing_fields(self):
        response = self.client.post(self.url, {"submittedBy": "candidate-1"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["msg"], "Missing required fields")

    def test_submit_quiz_rejects_question_without_text(self):
        invalid_payload = {
            **self.valid_payload,
            "question": [{"answerText": "no question text"}],
        }
        response = self.client.post(self.url, invalid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["msg"], "Question text is required")
