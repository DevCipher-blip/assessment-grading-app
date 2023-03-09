export async function QuizPost(quiz) {
  const base_url = process.env.REACT_APP_API_BASEURL;
  if (!base_url) {
    throw new Error("REACT_APP_API_BASEURL is not configured");
  }

  try {
    const response = await fetch(`${base_url}submit_quiz/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: quiz,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      const message = payload.msg || payload.detail || "Failed to submit quiz";
      throw new Error(message);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to connect to quiz API");
  }
}
