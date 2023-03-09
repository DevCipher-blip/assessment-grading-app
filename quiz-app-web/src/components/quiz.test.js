import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Quiz from "./quiz";
import { QuizPost } from "../routes/api";

jest.mock("react-countdown", () => () => <div>timer</div>);
jest.mock("../routes/api", () => ({
  QuizPost: jest.fn(),
}));

describe("Quiz component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits answers and shows completion message", async () => {
    QuizPost.mockResolvedValueOnce({ msg: "saved" });
    render(<Quiz />);

    const answers = ["a1", "a2", "a3", "a4", "a5"];
    for (let index = 0; index < answers.length; index += 1) {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: answers[index] } });
      const buttonText = index === answers.length - 1 ? "Submit" : "Next";
      fireEvent.click(screen.getByRole("button", { name: buttonText }));
    }

    await waitFor(() => {
      expect(screen.getByText("Thank you for taking this quiz.")).toBeInTheDocument();
    });
    expect(QuizPost).toHaveBeenCalledTimes(1);
  });
});


test("a failed final save preserves the answer for retry", async () => {
  QuizPost.mockReset();
  QuizPost.mockRejectedValueOnce(new Error("Network unavailable"));
  QuizPost.mockResolvedValueOnce({ msg: "saved" });
  render(<Quiz />);
  for (let index = 0; index < 4; index += 1) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
  }
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Keep this answer" } });
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("textbox", { name: "Your answer" })).toHaveValue("Keep this answer");
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await screen.findByText("Thank you for taking this quiz.");
  expect(QuizPost.mock.calls[1][0].question[4].answerText).toBe("Keep this answer");
});


test("typing does not extend the three-minute question limit", () => {
  jest.useFakeTimers();
  try {
    render(<Quiz />);
    act(() => jest.advanceTimersByTime(2 * 60 * 1000));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A partial answer" } });
    act(() => jest.advanceTimersByTime(60 * 1000));
    expect(screen.getByText("What should happen when a database transaction fails?")).toBeInTheDocument();
  } finally {
    jest.useRealTimers();
  }
});
