import React, { useState, useEffect } from "react";
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
  const startDate = React.useRef(Date.now());

  useEffect(() => {
    if (submitted) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      handleAnswerOptionClick();
    }, 3 * 60 * 1000);

    return () => clearTimeout(timeoutId);
  }, [currentQuestion, currentAnswer, submitted]);

  const handleAnswerOptionClick = async () => {
    const updatedQuestions = questionsList.map((item, index) =>
      index === currentQuestion ? { ...item, answerText: currentAnswer } : item
    );
    setQuestionsList(updatedQuestions);
    setCurrentAnswer("");

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      const quiz = {
        question: updatedQuestions,
        submittedBy: "",
        evaluatedBy: "",
        score: 0,
      };
      try {
        await QuizPost(quiz);
        setSubmitted(true);
      } catch (error) {
        setSubmitError(error.message);
      }
    }
  };
  return (
    <div className="app">
      {!submitted ? (
        <div>
          <Countdown date={startDate.current + questions.length * 3 * 60000} />
        </div>
      ) : (
        ""
      )}

      {submitted ? (
        <div className="score-section">Thank you for taking this quiz.</div>
      ) : (
        <>
          {submitError ? <div className="score-section">{submitError}</div> : null}
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentQuestion + 1}</span>/{questions.length}
            </div>
            <div className="question-text">
              {questions[currentQuestion].questionText}
            </div>
            <input
              id="myInput"
              className="answer-input"
              value={currentAnswer}
              onChange={(event) => setCurrentAnswer(event.target.value)}
            />
          </div>
          <div className="answer-section">
            {currentQuestion + 1 === questions.length ? (
              <button onClick={() => handleAnswerOptionClick()}>Submit</button>
            ) : (
              <button onClick={() => handleAnswerOptionClick()}>Next</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Quiz;
