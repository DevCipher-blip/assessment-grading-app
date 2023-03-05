import { useCallback, useEffect, useId, useRef, useState } from "react";

import prompts, { MAX_ANSWER_LENGTH, MAX_NAME_LENGTH, QUESTION_MS } from "../constants/constants";
import useRemaining, { formatClock } from "../hooks/useRemaining";
import { QuizPost } from "../routes/api";
import "../style/quiz.css";

const blankAnswers = () => prompts.map(() => "");

export default function Quiz() {
  const [phase, setPhase] = useState("intro");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState(blankAnswers);
  const [current, setCurrent] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const busy = useRef(false);
  const timedOutQuestion = useRef(-1);
  const answerRef = useRef(null);
  const doneHeadingRef = useRef(null);
  const ids = useId();

  const answering = phase === "answering";
  const isLast = current === prompts.length - 1;
  const remaining = useRemaining(deadline, answering && !isSaving && !submitError);

  const begin = (event) => {
    event.preventDefault();
    setAnswers(blankAnswers());
    setCurrent(0);
    setSubmitError("");
    setSubmissionId(null);
    timedOutQuestion.current = -1;
    setDeadline(Date.now() + QUESTION_MS);
    setPhase("answering");
  };

  const advance = useCallback(async () => {
    if (busy.current || phase !== "answering") return;
    if (!isLast) {
      setCurrent((index) => index + 1);
      setDeadline(Date.now() + QUESTION_MS);
      timedOutQuestion.current = -1;
      return;
    }
    busy.current = true;
    setIsSaving(true);
    setSubmitError("");
    try {
      const result = await QuizPost({
        submittedBy: name.trim(),
        question: prompts.map((questionText, index) => ({ questionText, answerText: answers[index] })),
      });
      setSubmissionId(result.id ?? null);
      setPhase("done");
    } catch (error) {
      setSubmitError(error.message || "Your answers could not be saved. Please try again.");
    } finally {
      busy.current = false;
      setIsSaving(false);
    }
  }, [phase, isLast, name, answers]);

  useEffect(() => {
    if (!answering || isSaving || submitError || timedOutQuestion.current === current) return undefined;
    const timer = setTimeout(() => {
      timedOutQuestion.current = current;
      void advance();
    }, Math.max(0, deadline - Date.now()));
    return () => clearTimeout(timer);
  }, [answering, deadline, current, isSaving, submitError, advance]);

  useEffect(() => {
    if (answering) answerRef.current?.focus();
    if (phase === "done") doneHeadingRef.current?.focus();
  }, [answering, phase, current]);

  const updateAnswer = (value) =>
    setAnswers((previous) => previous.map((answer, index) => (index === current ? value : answer)));

  return (
    <div className="page">
      <header className="masthead">
        <p className="brand">
          Goalpost<span className="brand-note">written goal reviews</span>
        </p>
      </header>

      <main className="sheet">
        {phase === "intro" && (
          <section aria-labelledby={`${ids}-intro`}>
            <h1 id={`${ids}-intro`}>Five questions about one goal.</h1>
            <p className="lede">
              Pick a goal you are working on and answer in your own words. Each question has three minutes; when the
              time runs out the page moves on and keeps what you wrote. A reviewer scores the full set later. Nothing
              is graded automatically.
            </p>
            <form className="start" onSubmit={begin}>
              <label htmlFor={`${ids}-name`}>Name or initials (optional)</label>
              <input
                id={`${ids}-name`}
                type="text"
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button type="submit">Begin</button>
            </form>
          </section>
        )}

        {answering && (
          <section className="question" aria-labelledby={`${ids}-prompt`}>
            <div className="question-meta">
              <span>
                Question {current + 1} of {prompts.length}
              </span>
              <span className={remaining <= 30000 ? "clock clock-low" : "clock"} role="timer" aria-live="off">
                <span className="visually-hidden">Time left for this question: </span>
                {formatClock(remaining)}
              </span>
            </div>
            <progress value={current + 1} max={prompts.length} aria-label="Questions answered" />
            <h2 id={`${ids}-prompt`}>{prompts[current]}</h2>
            <label htmlFor={`${ids}-answer`}>Your answer</label>
            <textarea
              id={`${ids}-answer`}
              ref={answerRef}
              rows={6}
              maxLength={MAX_ANSWER_LENGTH}
              value={answers[current]}
              onChange={(event) => updateAnswer(event.target.value)}
              disabled={isSaving}
              aria-describedby={`${ids}-hint`}
            />
            <p className="hint" id={`${ids}-hint`}>
              <span>{answers[current].length} / {MAX_ANSWER_LENGTH} characters</span>
              <span>Blank answers are saved as blank.</span>
            </p>
            {submitError && (
              <div role="alert" className="save-error">
                <p>{submitError}</p>
                <p>Your answers are still here. Try again when the API is reachable.</p>
              </div>
            )}
            <div className="actions">
              <button type="button" disabled={isSaving} onClick={() => void advance()}>
                {isSaving ? "Saving…" : isLast ? (submitError ? "Try again" : "Submit answers") : "Next question"}
              </button>
            </div>
          </section>
        )}

        {phase === "done" && (
          <section className="done" role="status">
            <h2 tabIndex={-1} ref={doneHeadingRef}>
              Answers saved
            </h2>
            <p>
              {submissionId ? `Your submission is number ${submissionId}. ` : ""}A reviewer will read and score the
              set. No score is calculated automatically.
            </p>
            <button type="button" className="secondary" onClick={() => setPhase("intro")}>
              Answer another goal
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
