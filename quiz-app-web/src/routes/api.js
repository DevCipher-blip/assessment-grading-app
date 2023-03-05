const OFFLINE_MESSAGE = "The answers could not reach the server. Check that the API is running and try again.";

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function QuizPost(quiz) {
  const baseUrl = import.meta.env.VITE_API_BASEURL;
  if (!baseUrl) {
    throw new Error("VITE_API_BASEURL is not configured");
  }

  let response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}/submit_quiz/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: quiz }),
    });
  } catch {
    // fetch only rejects for network-level failures (server down, CORS, offline).
    throw new Error(OFFLINE_MESSAGE);
  }

  const payload = await readJson(response);
  if (!response.ok) {
    throw new Error(payload?.msg || payload?.detail || `The server rejected the answers (HTTP ${response.status}).`);
  }
  return payload ?? {};
}
