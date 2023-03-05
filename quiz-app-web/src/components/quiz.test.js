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


it("retains the final answer after a failed save and prevents duplicate pending submissions", async()=>{
 QuizPost.mockReset();QuizPost.mockRejectedValueOnce(new Error("Synthetic failure"));
 render(<Quiz/>);
 for(let i=0;i<4;i++){fireEvent.change(screen.getByRole('textbox'),{target:{value:'Synthetic answer '+i}});fireEvent.click(screen.getByRole('button',{name:'Next'}));}
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'Keep this final answer'}});fireEvent.click(screen.getByRole('button',{name:'Submit'}));
 await screen.findByRole('alert');expect(screen.getByRole('textbox')).toHaveValue('Keep this final answer');
 let resolve;QuizPost.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
 fireEvent.click(screen.getByRole('button',{name:'Submit'}));expect(screen.getByRole('button',{name:'Saving…'})).toBeDisabled();
 resolve({msg:'saved'});await screen.findByText('Thank you for taking this quiz.');expect(QuizPost).toHaveBeenCalledTimes(2);
});

it("typing does not extend the per-question deadline",()=>{
 jest.useFakeTimers();render(<Quiz/>);
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'A draft'}});
 jest.advanceTimersByTime(170000);
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'Still drafting'}});
 const {act}=require('@testing-library/react');act(()=>jest.advanceTimersByTime(10000));
 expect(screen.getByText('Question 2 / 5')).toBeInTheDocument();jest.useRealTimers();
});
