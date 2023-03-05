from django.core.management.base import BaseCommand
from django.db import transaction

from quiz.models import Question, Quiz, QuizAnswer

PROMPTS = [
    "Describe one goal you are working toward right now. What will be true when it is done?",
    "Why does this goal matter, and who else is affected by it?",
    "What is the next concrete step, and when will you take it?",
    "What is most likely to get in the way, and how will you respond?",
    "How will you tell, week to week, whether you are making progress?",
]

DEMO_SUBMISSIONS = [
    {
        "submitted_by": "Demo Learner A",
        "score": 8,
        "evaluated_by": "demo-reviewer",
        "answers": [
            "Run a 10 km race in under an hour by the end of spring.",
            "It keeps me consistent with exercise, and my running group is training for the same race.",
            "Book three short runs into my calendar for next week, starting Monday morning.",
            "Bad weather. I will keep an indoor treadmill session as the backup plan.",
            "I log every run and compare my average pace each Sunday.",
        ],
    },
    {
        "submitted_by": "Demo Learner B",
        "score": None,
        "evaluated_by": "",
        "answers": [
            "Finish the first draft of a short guide for new volunteers.",
            "New volunteers keep asking the same questions; a guide saves everyone time.",
            "Outline the five sections tonight.",
            "Other tasks crowding it out. I will block two evenings a week.",
            "",
        ],
    },
    {
        "submitted_by": "",
        "score": None,
        "evaluated_by": "",
        "answers": [
            "Learn enough Spanish to order food and ask for directions.",
            "A family trip is planned for next summer.",
            "Do fifteen minutes of practice after dinner, starting today.",
            "Losing interest after the first weeks.",
            "Each Friday I try a two-minute conversation with a friend who speaks Spanish.",
        ],
    },
]


class Command(BaseCommand):
    help = "Create a few demo submissions (fictional people and goals) when the database has none."

    def handle(self, *args, **options):
        if Quiz.objects.exists():
            self.stdout.write("Submissions already exist; nothing seeded.")
            return
        with transaction.atomic():
            questions = [Question.objects.get_or_create(question_text=text)[0] for text in PROMPTS]
            for demo in DEMO_SUBMISSIONS:
                quiz = Quiz.objects.create(
                    submitted_by=demo["submitted_by"], score=demo["score"], evaluated_by=demo["evaluated_by"]
                )
                quiz.question_response.add(
                    *[
                        QuizAnswer.objects.create(question=question, submitted_answer=answer)
                        for question, answer in zip(questions, demo["answers"], strict=True)
                    ]
                )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(DEMO_SUBMISSIONS)} demo submissions."))
