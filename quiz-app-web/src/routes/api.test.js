import { QuizPost } from "./api";

describe("QuizPost", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, REACT_APP_API_BASEURL: "http://localhost:8000/" };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("posts quiz and returns response payload", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ msg: "ok" }),
    });
    const response = await QuizPost({ submittedBy: "test" });

    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/submit_quiz/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { submittedBy: "test" },
      }),
    });
    expect(response).toEqual({ msg: "ok" });
  });

  it("throws API message when server responds with error payload", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ msg: "Missing required fields" }),
    });

    await expect(QuizPost({})).rejects.toThrow("Missing required fields");
  });
});
