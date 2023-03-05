import { act, fireEvent, render, screen } from "@testing-library/react";

import prompts, { QUESTION_MS } from "../constants/constants";
import { QuizPost } from "../routes/api";
import Quiz from "./quiz.jsx";

vi.mock("../routes/api", () => ({ QuizPost: vi.fn() }));

const begin = (name) => {
  if (name !== undefined) fireEvent.change(screen.getByLabelText(/name or initials/i), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Begin" }));
};

const answerAll = (answers) => {
  answers.forEach((text, index) => {
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: text } });
    const label = index === answers.length - 1 ? "Submit answers" : "Next question";
    fireEvent.click(screen.getByRole("button", { name: label }));
  });
};

describe("Quiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on an intro screen without running the clock", () => {
    render(<Quiz />);

    expect(screen.getByRole("heading", { name: "Five questions about one goal." })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("submits every answer with the optional name and shows the reference", async () => {
    QuizPost.mockResolvedValueOnce({ msg: "saved", id: 42 });
    render(<Quiz />);
    begin("  Demo Learner ");

    const answers = ["a1", "a2", "a3", "a4", "a5"];
    answerAll(answers);

    expect(await screen.findByRole("heading", { name: "Answers saved" })).toHaveFocus();
    expect(screen.getByText(/submission is number 42/)).toBeInTheDocument();
    expect(QuizPost).toHaveBeenCalledTimes(1);
    const sent = QuizPost.mock.calls[0][0];
    expect(sent).not.toHaveProperty("score");
    expect(sent.submittedBy).toBe("Demo Learner");
    expect(sent.question).toEqual(prompts.map((questionText, i) => ({ questionText, answerText: answers[i] })));
  });

  it("moves focus to the answer box and counts characters", () => {
    render(<Quiz />);
    begin();

    const box = screen.getByLabelText("Your answer");
    expect(box).toHaveFocus();
    fireEvent.change(box, { target: { value: "Twelve chars" } });
    expect(screen.getByText("12 / 800 characters")).toBeInTheDocument();
  });

  it("keeps every answer after a failed save and blocks duplicate submits", async () => {
    QuizPost.mockRejectedValueOnce(new Error("Synthetic failure"));
    render(<Quiz />);
    begin();
    answerAll(["one", "two", "three", "four", "Keep this final answer"]);

    expect(await screen.findByRole("alert")).toHaveTextContent("Synthetic failure");
    expect(screen.getByLabelText("Your answer")).toHaveValue("Keep this final answer");

    let resolve;
    QuizPost.mockImplementationOnce(() => new Promise((done) => (resolve = done)));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Saving…" }));

    await act(async () => resolve({ msg: "saved", id: 7 }));
    expect(screen.getByRole("heading", { name: "Answers saved" })).toBeInTheDocument();
    expect(QuizPost).toHaveBeenCalledTimes(2);
    expect(QuizPost.mock.calls[1][0].question.map((q) => q.answerText)).toEqual([
      "one",
      "two",
      "three",
      "four",
      "Keep this final answer",
    ]);
  });

  it("shows the per-question clock as m:ss", () => {
    vi.useFakeTimers();
    render(<Quiz />);
    begin();
    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("timer")).toHaveTextContent("2:59");
  });

  it("typing does not extend the per-question deadline", () => {
    vi.useFakeTimers();
    render(<Quiz />);
    begin();

    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "A draft" } });
    act(() => vi.advanceTimersByTime(QUESTION_MS - 10000));
    fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "Still drafting" } });
    act(() => vi.advanceTimersByTime(10000));

    expect(screen.getByText(`Question 2 of ${prompts.length}`)).toBeInTheDocument();
  });

  it("submits automatically when the last question runs out of time", async () => {
    vi.useFakeTimers();
    QuizPost.mockResolvedValue({ msg: "saved", id: 3 });
    render(<Quiz />);
    begin();

    for (let i = 0; i < prompts.length; i += 1) {
      await act(async () => vi.advanceTimersByTime(QUESTION_MS));
    }

    expect(QuizPost).toHaveBeenCalledTimes(1);
    expect(QuizPost.mock.calls[0][0].question.every((q) => q.answerText === "")).toBe(true);
    expect(screen.getByRole("heading", { name: "Answers saved" })).toBeInTheDocument();
  });

  it("returns to the intro with blank answers for another goal", async () => {
    QuizPost.mockResolvedValueOnce({ msg: "saved", id: 1 });
    render(<Quiz />);
    begin();
    answerAll(["a", "b", "c", "d", "e"]);
    fireEvent.click(await screen.findByRole("button", { name: "Answer another goal" }));
    begin();

    expect(screen.getByLabelText("Your answer")).toHaveValue("");
    expect(screen.getByText(`Question 1 of ${prompts.length}`)).toBeInTheDocument();
  });
});
