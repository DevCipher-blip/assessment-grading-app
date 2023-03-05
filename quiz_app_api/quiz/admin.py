from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html, format_html_join

from quiz.models import Question, Quiz, QuizAnswer

admin.site.site_header = "Goalpost reviews"
admin.site.site_title = "Goalpost reviews"
admin.site.index_title = "Score written goal responses"

RESPONSE_ROW = (
    '<dt style="font-weight:600;margin-top:.75rem">{}</dt><dd style="margin:.25rem 0 0;white-space:pre-wrap">{}</dd>'
)


class ScoredFilter(admin.SimpleListFilter):
    title = "review status"
    parameter_name = "reviewed"

    def lookups(self, request, model_admin):
        return [("no", "Awaiting a score"), ("yes", "Scored")]

    def queryset(self, request, queryset):
        if self.value() == "no":
            return queryset.filter(score__isnull=True)
        if self.value() == "yes":
            return queryset.filter(score__isnull=False)
        return queryset


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["__str__", "submitted_by", "answer_count", "score_display", "evaluated_by"]
    list_filter = [ScoredFilter]
    search_fields = ["submitted_by", "evaluated_by", "question_response__submitted_answer"]
    fields = ["submitted_by", "responses", "score", "evaluated_by"]
    readonly_fields = ["submitted_by", "responses"]

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_answer_count=Count("question_response"))

    @admin.display(description="answers", ordering="_answer_count")
    def answer_count(self, obj):
        return obj._answer_count

    @admin.display(description="score", ordering="score")
    def score_display(self, obj):
        return "awaiting review" if obj.score is None else obj.score

    @admin.display(description="responses")
    def responses(self, obj):
        answers = obj.question_response.select_related("question").order_by("id")
        rows = format_html_join(
            "",
            RESPONSE_ROW,
            ((answer.question.question_text, answer.submitted_answer or "(left blank)") for answer in answers),
        )
        return format_html('<dl style="margin:0;max-width:60rem">{}</dl>', rows)

    def save_model(self, request, obj, form, change):
        if obj.score is not None and not obj.evaluated_by:
            obj.evaluated_by = request.user.get_username()
        super().save_model(request, obj, form, change)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["question_text"]
    search_fields = ["question_text"]


@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    list_display = ["__str__", "question", "submitted_answer"]
    list_select_related = ["question"]
