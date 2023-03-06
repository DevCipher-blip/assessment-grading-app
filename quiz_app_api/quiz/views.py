from django.db import transaction
from rest_framework import status, views
from rest_framework.response import Response

from quiz.models import Question, Quiz, QuizAnswer


def _extract_quiz_payload(request_data):
    """
    Accept both payload variants:
    - {"data": {...}} used by the current frontend
    - {...} documented in the API README
    """
    payload = request_data.get("data", request_data)
    if not isinstance(payload, dict):
        return None
    return payload


def _validate_payload(payload):
    required_keys = {"submittedBy", "evaluatedBy", "score", "question"}
    if not payload or not required_keys.issubset(payload):
        return "Missing required fields"
    if not isinstance(payload["question"], list) or not payload["question"]:
        return "Question list must be a non-empty array"
    return None


class SubmitQuizApiView(views.APIView):
    def post(self, request):
        payload = _extract_quiz_payload(request.data)
        error = _validate_payload(payload)
        if error:
            return Response(
                data={"msg": error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                quiz = Quiz.objects.create(
                    submitted_by=payload["submittedBy"],
                    evaluated_by=payload["evaluatedBy"],
                    score=payload["score"],
                )
                for question_obj in payload["question"]:
                    question_text = question_obj.get("questionText")
                    answer_text = question_obj.get("answerText", "")
                    if not question_text:
                        raise ValueError("Question text is required")

                    quiz_question, created = Question.objects.get_or_create(
                        question_text=question_text
                    )
                    quiz_answer = QuizAnswer.objects.create(
                        question=quiz_question,
                        submitted_answer=answer_text,
                    )
                    quiz.question_response.add(quiz_answer)
            return Response(
                data={"msg": "Quiz response saved successfully"},
                status=status.HTTP_201_CREATED,
            )
        except ValueError as exc:
            return Response(
                data={"msg": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(
                data={"msg": "Something went wrong while saving response"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
