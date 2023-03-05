// The prompts ask about the same goal so a reviewer can score the set as one plan.
const questions = [
  "Describe one goal you are working toward right now. What will be true when it is done?",
  "Why does this goal matter, and who else is affected by it?",
  "What is the next concrete step, and when will you take it?",
  "What is most likely to get in the way, and how will you respond?",
  "How will you tell, week to week, whether you are making progress?",
].map((questionText) => ({ questionText, answerText: "" }));

export default questions;
