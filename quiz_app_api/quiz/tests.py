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


    def test_non_object_payload_and_question_items_are_bad_requests(self):
        for payload in [[], {**self.valid_payload, "question": ["not an object"]}, {**self.valid_payload,"score":True}, {**self.valid_payload,"submittedBy":[]}]:
            response=self.client.post(self.url,payload,format="json")
            self.assertEqual(response.status_code,400)
        self.assertEqual(Quiz.objects.count(),0)

    def test_late_invalid_answer_does_not_leave_partial_records(self):
        payload={**self.valid_payload,"question":[self.valid_payload["question"][0],{"questionText":"Synthetic later question","answerText":"x"*801}]}
        response=self.client.post(self.url,payload,format="json")
        self.assertEqual(response.status_code,400)
        self.assertEqual(Quiz.objects.count(),0)
        self.assertEqual(Question.objects.count(),0)
