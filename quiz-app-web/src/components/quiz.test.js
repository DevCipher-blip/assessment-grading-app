import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
