from django.db import transaction
from rest_framework import status, views
from rest_framework.response import Response

from quiz.models import Question, Quiz, QuizAnswer

MAX_QUESTIONS = 100
MAX_LABEL_LENGTH = 150
MAX_QUESTION_LENGTH = 500
MAX_ANSWER_LENGTH = 800
INT32_MIN, INT32_MAX = -(2**31), 2**31 - 1


def _extract_quiz_payload(request_data):
    """
    Accept both payload variants:
    - {"data": {...}} sent by the web client
    - {...} documented in the API README
    """
    if not isinstance(request_data, dict):
        return None
    payload = request_data.get("data", request_data)
    if not isinstance(payload, dict):
        return None
    return payload


def _validate_payload(payload):
    if not payload or "question" not in payload:
        return "Missing required fields"
    if not isinstance(payload["question"], list) or not payload["question"]:
        return "Question list must be a non-empty array"
    for field in ["submittedBy", "evaluatedBy"]:
        value = payload.get(field, "")
        if not isinstance(value, str) or len(value) > MAX_LABEL_LENGTH:
            return "Submitter and evaluator must be strings of at most 150 characters"
    score = payload.get("score")
    if score is not None and (
        isinstance(score, bool) or not isinstance(score, int) or not INT32_MIN <= score <= INT32_MAX
    ):
        return "Score must be a signed 32-bit integer or null"
    if len(payload["question"]) > MAX_QUESTIONS:
        return "At most 100 questions are accepted"
    for item in payload["question"]:
        if not isinstance(item, dict):
            return "Each question must be an object"
        text = item.get("questionText")
        answer = item.get("answerText", "")
        if not isinstance(text, str) or not text.strip():
            return "Question text is required"
        if len(text) > MAX_QUESTION_LENGTH or not isinstance(answer, str) or len(answer) > MAX_ANSWER_LENGTH:
            return "Question text is limited to 500 characters and answers to 800"
    return None


class SubmitQuizApiView(views.APIView):
    def post(self, request):
        payload = _extract_quiz_payload(request.data)
        error = _validate_payload(payload)
        if error:
            return Response(data={"msg": error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            quiz = Quiz.objects.create(
                submitted_by=payload.get("submittedBy", ""),
                evaluated_by=payload.get("evaluatedBy", ""),
                score=payload.get("score"),
            )
            answers = []
            for item in payload["question"]:
                question, _ = Question.objects.get_or_create(question_text=item["questionText"])
                answers.append(
                    QuizAnswer.objects.create(question=question, submitted_answer=item.get("answerText", ""))
                )
            quiz.question_response.add(*answers)

        return Response(
            data={"msg": "Quiz response saved successfully", "id": quiz.id},
            status=status.HTTP_201_CREATED,
        )
