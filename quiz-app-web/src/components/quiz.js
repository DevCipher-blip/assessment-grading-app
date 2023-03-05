import React, { useState, useEffect, useCallback, useRef } from "react";
import questions from "../constants/constants";
import { QuizPost } from "../routes/api";
import Countdown from "react-countdown";
import "../style/quiz.css";
const QUESTION_MS = 3 * 60 * 1000;
const Quiz = () => {
 const [questionsList,setQuestionsList]=useState(questions);
 const [currentQuestion,setCurrentQuestion]=useState(0);
 const [submitted,setSubmitted]=useState(false);
 const [currentAnswer,setCurrentAnswer]=useState("");
 const [submitError,setSubmitError]=useState("");
 const [isSaving,setIsSaving]=useState(false);
 const [deadline,setDeadline]=useState(()=>Date.now()+QUESTION_MS);
 const busy=useRef(false);
 const timedOutQuestion=useRef(-1);
 const advance=useCallback(async()=>{
  if(busy.current||submitted)return;
  const updated=questionsList.map((item,index)=>index===currentQuestion?{...item,answerText:currentAnswer}:item);
  if(currentQuestion+1<questions.length){setQuestionsList(updated);setCurrentAnswer("");setCurrentQuestion(value=>value+1);setDeadline(Date.now()+QUESTION_MS);timedOutQuestion.current=-1;return;}
  busy.current=true;setIsSaving(true);setSubmitError("");
  try{await QuizPost({question:updated,submittedBy:"",evaluatedBy:"",score:0});setQuestionsList(updated);setSubmitted(true);}
  catch(error){setSubmitError(error.message || "Your answers could not be saved. Please try again.");}
  finally{busy.current=false;setIsSaving(false);}
 },[questionsList,currentQuestion,currentAnswer,submitted]);
 useEffect(()=>{
  if(submitted||isSaving||submitError||timedOutQuestion.current===currentQuestion)return;
  const timer=setTimeout(()=>{timedOutQuestion.current=currentQuestion;void advance();},Math.max(0,deadline-Date.now()));
  return()=>clearTimeout(timer);
 },[deadline,currentQuestion,submitted,isSaving,submitError,advance]);
 return <main className="app"><header><p className="eyebrow">WRITTEN RESPONSE EXERCISE</p><h1>A few questions.<br/>Your own words.</h1><p className="intro">Five preset prompts. Answers are saved to the local API; this demo does not grade them.</p></header>{submitted?<section className="completion" role="status"><h2>Thank you for taking this quiz.</h2><p>Your responses were saved. No grade or evaluation has been calculated.</p></section>:<section className="question-card"><div className="question-meta"><span>Question {currentQuestion+1} / {questions.length}</span><span>Time for this question: <Countdown key={currentQuestion} date={deadline}/></span></div><progress value={currentQuestion+1} max={questions.length} aria-label="Quiz progress"/><h2>{questions[currentQuestion].questionText}</h2><label htmlFor="answer">Your answer</label><textarea id="answer" className="answer-input" rows={4} maxLength={800} value={currentAnswer} onChange={event=>setCurrentAnswer(event.target.value)} disabled={isSaving}/><p className="hint">Up to 800 characters. After three minutes this question advances; unanswered prompts are saved blank.</p>{submitError&&<p role="alert" className="save-error">{submitError} Your final draft has been kept.</p>}<div className="answer-section"><button disabled={isSaving} onClick={()=>void advance()}>{isSaving?"Saving…":currentQuestion+1===questions.length?"Submit":"Next"}</button></div></section>}</main>;
};
export default Quiz;
