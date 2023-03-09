import React, { useState, useEffect, useRef } from "react";
import questions from "../constants/constants";
import { QuizPost } from "../routes/api";
import Countdown from "react-countdown";
import "../style/quiz.css";

const Quiz = () => {
  const [questionsList, setQuestionsList] = useState(questions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startDate = useRef(Date.now());
  const advance = useRef();

  const handleAnswerOptionClick = async () => {
    if (isSubmitting || submitted) return;
    setSubmitError("");
    const updatedQuestions = questionsList.map((item, index) =>
      index === currentQuestion ? { ...item, answerText: currentAnswer } : item
    );
    setQuestionsList(updatedQuestions);
    if (currentQuestion + 1 < questions.length) {
      setCurrentAnswer("");
      setCurrentQuestion(currentQuestion + 1);
      return;
    }
    setIsSubmitting(true);
    try {
      await QuizPost({ question: updatedQuestions, submittedBy: "portfolio-demo", evaluatedBy: "", score: 0 });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || "Your answers could not be saved. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };
  advance.current = handleAnswerOptionClick;

  useEffect(() => {
    if (submitted) return undefined;
    const timeoutId = setTimeout(() => advance.current(), 3 * 60 * 1000);
    return () => clearTimeout(timeoutId);
  }, [currentQuestion, submitted]);

  return (
    <main className="assessment-shell">
      <header className="assessment-heading">
        <span className="eyebrow">DEMO WORKSPACE</span>
        <h1>Technical assessment</h1>
        <p>Five short answers. One focused session.</p>
      </header>
      <section className="app" aria-label="Assessment questions">
        {submitted ? (
          <div className="score-section" role="status">
            <span className="completion-mark" aria-hidden="true">✓</span>
            <h2>Thank you for taking this quiz.</h2>
            <p>Your answers have been saved for review.</p>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); handleAnswerOptionClick(); }}>
            <div className="session-summary">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span className="timer" aria-label="Session time remaining">
                <Countdown date={startDate.current + questions.length * 3 * 60000} />
              </span>
            </div>
            <progress aria-label="Assessment progress" max={questions.length} value={currentQuestion} />
            <div className="question-section">
              <h2 id="question-heading">{questions[currentQuestion].questionText}</h2>
              <label htmlFor="quiz-answer">Your answer</label>
              <textarea id="quiz-answer" className="answer-input" rows={5}
                aria-describedby="answer-help" value={currentAnswer} disabled={isSubmitting}
                onChange={(event) => setCurrentAnswer(event.target.value)} />
              <p id="answer-help">Use your own words. Each question allows up to three minutes.</p>
            </div>
            {submitError ? <p className="submission-error" role="alert">{submitError} Your final answer is still here.</p> : null}
            <div className="answer-section">
              <span>Responses are saved when you submit the assessment.</span>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : currentQuestion + 1 === questions.length ? "Submit" : "Next"}
              </button>
            </div>
          </form>
        )}
      </section>
      <p className="demo-note">Sample questions · No sign-in required · No automatic grading</p>
    </main>
  );
};
export default Quiz;
