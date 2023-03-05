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
        self.assertEqual(response.data["id"], Quiz.objects.get().id)
        self.assertEqual(QuizAnswer.objects.count(), 2)
        self.assertEqual(Question.objects.count(), 2)

    def test_submit_quiz_accepts_data_wrapped_payload(self):
        response = self.client.post(self.url, {"data": self.valid_payload}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Quiz.objects.count(), 1)

    def test_answers_only_payload_is_stored_unscored(self):
        response = self.client.post(self.url, {"question": self.valid_payload["question"]}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        quiz = Quiz.objects.get()
        self.assertIsNone(quiz.score)
        self.assertEqual(quiz.submitted_by, "")
        self.assertEqual(quiz.evaluated_by, "")

    def test_explicit_zero_score_is_kept(self):
        response = self.client.post(self.url, {**self.valid_payload, "score": 0}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Quiz.objects.get().score, 0)

    def test_answers_are_linked_to_their_submission_in_order(self):
        self.client.post(self.url, self.valid_payload, format="json")

        quiz = Quiz.objects.get()
        stored = [(a.question.question_text, a.submitted_answer) for a in quiz.question_response.order_by("id")]
        self.assertEqual(stored, [("What is Python?", "A language"), ("What is Django?", "A framework")])

    def test_repeated_prompt_reuses_the_question_row(self):
        self.client.post(self.url, self.valid_payload, format="json")
        self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(Question.objects.count(), 2)
        self.assertEqual(QuizAnswer.objects.count(), 4)

    def test_submit_quiz_rejects_missing_fields(self):
        response = self.client.post(self.url, {"submittedBy": "candidate-1"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["msg"], "Missing required fields")

    def test_submit_quiz_rejects_question_without_text(self):
        invalid_payload = {**self.valid_payload, "question": [{"answerText": "no question text"}]}
        response = self.client.post(self.url, invalid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["msg"], "Question text is required")

    def test_non_object_payload_and_question_items_are_bad_requests(self):
        for payload in [
            [],
            {**self.valid_payload, "question": ["not an object"]},
            {**self.valid_payload, "question": []},
            {**self.valid_payload, "score": True},
            {**self.valid_payload, "score": "0"},
            {**self.valid_payload, "score": 2**31},
            {**self.valid_payload, "submittedBy": []},
            {**self.valid_payload, "evaluatedBy": "x" * 151},
        ]:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload, format="json")
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Quiz.objects.count(), 0)

    def test_question_count_is_capped(self):
        many = [{"questionText": f"Prompt {i}", "answerText": ""} for i in range(101)]
        response = self.client.post(self.url, {"question": many}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["msg"], "At most 100 questions are accepted")

    def test_late_invalid_answer_does_not_leave_partial_records(self):
        payload = {
            **self.valid_payload,
            "question": [
                self.valid_payload["question"][0],
                {"questionText": "Synthetic later question", "answerText": "x" * 801},
            ],
        }
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Quiz.objects.count(), 0)
        self.assertEqual(Question.objects.count(), 0)

    def test_get_is_not_allowed(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
