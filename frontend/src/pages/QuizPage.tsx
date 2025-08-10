/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import generateCertificate from "../components/generateCertificate";
import { getToken } from "../utils/auth";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

export default function QuizPage() {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const { type } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        if (!getToken()) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://127.0.0.1:5000/api/get-user", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = res.data;
        if (data.status === "success") {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          navigate("/login");
        }
      } catch (err: any) {
        console.error("Login error:", err.message);
        navigate("/login");
      }
    }

    fetchUser();
  }, []);

  async function generateQuizFromGemini() {
    setGenerating(true);
    const prompt = `
  Generate a quiz of exactly 10 questions for a ${type} quiz with the following distribution and format:
  
  - Easy: 2 questions (1 MCQ, 1 Text)
  - Medium: 5 questions (3 MCQ, 2 Text)
  - Hard: 3 questions (1 MCQ, 2 Text or Voice)
  - for interview questions include general questions that can be asked in any interview and not specific to any company and no exact answers, just general questions but for this just give one answer to show.
  
  Output only a JSON array of questions, each question as an object with the following fields:
  - "question": string
  - "type": one of "mcq", "text", "voice"
  - "options": array of strings (only for "mcq" questions)
  - "answer": string (correct answer)
  
  No explanations or extra text, only JSON.
  `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { temperature: 0.5, maxOutputTokens: 1000, topK: 40 },
      });

      const jsonString = (response.text || "")
        .replace(/```json/, "")
        .replace(/```/, "")
        .trim();

      const quizData = JSON.parse(jsonString);
      console.log("Generated Quiz Data:", quizData);
      setQuiz(quizData);
      setStarted(true);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz, try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function validateAnswers() {
    setValidating(true);

    const prompt = `
You are an expert quiz grader. Given the following 10 questions with their correct answers and user answers, check each user answer and return JSON with:
- correct: boolean (true if user's answer is correct)
- score: number (10 points for each correct answer)
- totalScore: total out of 100
- answers are present in quiz[i].answer respectively but validate user answer with quiz[i].question as some users might have wrote the answer generally and it might be correct.

Questions:
${JSON.stringify(quiz, null, 2)}

User Answers:
${JSON.stringify(answers, null, 2)}

Return only JSON with this format:
{
  "results": [
    { "questionIndex": 0, "correct": true },
    { "questionIndex": 1, "correct": false },
    ...
  ],
  "score": 70,
  "totalScore": 100
}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });
      const rawText = response.text || "";
      const jsonString = rawText
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
      
      const result = JSON.parse(jsonString);
      console.log("Response:", answers);
      console.log("Answer Validation Result:", result);
      setScore(result.score || 0);
    } catch (e) {
      alert("Failed to validate answers. Try again.");
      console.error(e);
    } finally {
      setValidating(false);
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const currentQuestion = quiz[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="flex justify-between items-center bg-gray-900 px-6 py-4 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-300 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold capitalize">{type} Quiz</h1>
        <div></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!started && score === null && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to start your {type} quiz?
            </h2>
            <button
              onClick={generateQuizFromGemini}
              disabled={generating}
              className={`px-6 py-3 rounded-lg shadow-lg text-lg ${
                generating
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {generating ? "Generating Quiz..." : "Start Quiz"}
            </button>
          </div>
        )}

        {started && score === null && quiz.length > 0 && (
          <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Question {currentIndex + 1} of {quiz.length}
            </h3>
            <p className="mb-4">{currentQuestion.question}</p>

            {currentQuestion.type === "mcq" && (
              <div className="space-y-2">
                {currentQuestion.options.map((opt: string, idx: number) => (
                  <label
                    key={idx}
                    className="block bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`answer-${currentIndex}`}
                      value={opt}
                      checked={answers[currentIndex] === opt}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {(currentQuestion.type === "text" || currentQuestion.type === "voice") && (
              <textarea
                value={answers[currentIndex] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-3 rounded-lg bg-gray-700 text-white"
              />
            )}

            <div className="mt-6 flex justify-between">
              {currentIndex < quiz.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg shadow"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={validateAnswers}
                  disabled={validating}
                  className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg shadow"
                >
                  {validating ? "Validating..." : "Submit Quiz"}
                </button>
              )}
            </div>
          </div>
        )}

        {score !== null && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Your Score: {score} / {quiz.length * 10}
            </h2>
            {score >= 70 ? (
              <div>
                <p className="text-green-400 mb-4">
                  🎉 Congratulations! You passed.
                </p>
                <button
                  onClick={() =>
                    generateCertificate(
                      `${user?.name || "User"}`,
                      type || "",
                      (score / (quiz.length * 10)) * 100
                    )
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-lg text-white"
                >
                  Download Certificate
                </button>
              </div>
            ) : (
              <p className="text-red-400">❌ Sorry, you did not pass.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
