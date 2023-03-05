from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse

from quiz.models import Quiz


class ReviewerAdminTests(TestCase):
    def setUp(self):
        call_command("seed_demo", stdout=StringIO())
        self.reviewer = get_user_model().objects.create_superuser("reviewer", password="demo-only-password")
        self.client.force_login(self.reviewer)

    def test_changelist_marks_unscored_submissions(self):
        response = self.client.get(reverse("admin:quiz_quiz_changelist"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "awaiting review", count=2)

    def test_awaiting_filter_lists_only_unscored(self):
        response = self.client.get(reverse("admin:quiz_quiz_changelist"), {"reviewed": "no"})

        self.assertEqual(
            {quiz.score for quiz in response.context["cl"].queryset},
            {None},
        )
        self.assertEqual(response.context["cl"].result_count, 2)

    def test_change_page_shows_prompts_and_answers(self):
        quiz = Quiz.objects.get(submitted_by="Demo Learner B")
        response = self.client.get(reverse("admin:quiz_quiz_change", args=[quiz.pk]))

        self.assertContains(response, "What is the next concrete step")
        self.assertContains(response, "Outline the five sections tonight.")
        self.assertContains(response, "(left blank)")

    def test_scoring_records_the_reviewer_when_left_blank(self):
        quiz = Quiz.objects.get(submitted_by="Demo Learner B")
        response = self.client.post(
            reverse("admin:quiz_quiz_change", args=[quiz.pk]),
            {"score": "6", "evaluated_by": ""},
        )

        self.assertEqual(response.status_code, 302)
        quiz.refresh_from_db()
        self.assertEqual(quiz.score, 6)
        self.assertEqual(quiz.evaluated_by, "reviewer")
        self.assertEqual(quiz.question_response.count(), 5)

    def test_anonymous_users_cannot_open_the_review_screens(self):
        self.client.logout()
        response = self.client.get(reverse("admin:quiz_quiz_changelist"))

        self.assertEqual(response.status_code, 302)


class SeedDemoTests(TestCase):
    def test_seed_runs_once(self):
        call_command("seed_demo", stdout=StringIO())
        out = StringIO()
        call_command("seed_demo", stdout=out)

        self.assertEqual(Quiz.objects.count(), 3)
        self.assertIn("nothing seeded", out.getvalue())
