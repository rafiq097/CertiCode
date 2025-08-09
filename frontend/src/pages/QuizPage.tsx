/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import generateCertificate from "../components/generateCertificate";
import { getToken } from "../utils/auth";
import axios from "axios";

export default function QuizPage() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

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

  const generateMockQuiz = () => {
    const mcq = (q: string, opts: string[], ans: string) => ({
      question: q,
      type: "mcq",
      options: opts,
      answer: ans,
    });
    const textQ = (q: string, ans: string) => ({
      question: q,
      type: "text",
      answer: ans,
    });
    const voiceQ = (q: string, ans: string) => ({
      question: q,
      type: "voice",
      answer: ans,
    });

    let questions: any[] = [];

    if (type === "dev" || type === "dsa") {
      questions = [
        mcq(
          "What does HTML stand for?",
          [
            "Hyper Text Markup Language",
            "Home Tool Markup Language",
            "Hyperlinks Text Mark Language",
          ],
          "Hyper Text Markup Language"
        ),
        mcq("What is the value of 2 + 2 in JavaScript?", ["3", "4", "5"], "4"),

        mcq(
          "Which keyword is used to declare a constant in JavaScript?",
          ["let", "var", "const"],
          "const"
        ),
        mcq(
          "Which data structure uses FIFO?",
          ["Stack", "Queue", "Heap"],
          "Queue"
        ),
        textQ(
          "Explain the concept of closures in JavaScript.",
          "Closures allow a function to access variables from its outer scope even after the outer function has finished executing."
        ),
        voiceQ(
          "Describe binary search algorithm.",
          "Binary search repeatedly divides the sorted list in half until the target is found."
        ),
        textQ(
          "What is a promise in JavaScript?",
          "An object representing the eventual completion or failure of an asynchronous operation."
        ),

        mcq(
          "What is the time complexity of quicksort on average?",
          ["O(n log n)", "O(n^2)", "O(log n)"],
          "O(n log n)"
        ),
        voiceQ(
          "Explain the difference between process and thread.",
          "A process is an independent program in execution, while a thread is a smaller unit of execution within a process."
        ),
        textQ(
          "What is memoization in dynamic programming?",
          "An optimization technique that stores computed results to avoid redundant calculations."
        ),
      ];
    } else {
      questions = [
        textQ(
          "Explain REST API principles.",
          "REST uses stateless communication, resource-based URIs, and standard HTTP methods."
        ),
        voiceQ(
          "Describe how garbage collection works in Java.",
          "Automatically frees memory by removing objects no longer reachable."
        ),
        textQ(
          "What are microservices?",
          "An architectural style that structures an application as a collection of small, loosely coupled services."
        ),
        voiceQ(
          "Explain difference between TCP and UDP.",
          "TCP is connection-oriented, reliable; UDP is connectionless, faster but unreliable."
        ),
        textQ(
          "What is polymorphism in OOP?",
          "The ability of different objects to respond differently to the same function call."
        ),
        voiceQ(
          "Explain CAP theorem.",
          "States that in a distributed system you can only have two of Consistency, Availability, Partition tolerance."
        ),
        textQ(
          "What is dependency injection?",
          "A design pattern where dependencies are provided rather than hardcoded."
        ),
        voiceQ(
          "Describe event loop in Node.js.",
          "Handles asynchronous callbacks and non-blocking I/O."
        ),
        textQ(
          "What are design patterns?",
          "Reusable solutions to common software design problems."
        ),
        voiceQ(
          "Explain how HTTPS works.",
          "Uses SSL/TLS to encrypt data between client and server."
        ),
      ];
    }

    setQuiz(questions);
    setStarted(true);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentIndex]: value });
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quiz.forEach((q, i) => {
      if (answers[i]?.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correctCount++;
      }
    });
    const totalScore = correctCount * 10;
    setScore(totalScore);
  };

  const currentQuestion = quiz[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Top Bar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!started && score === null && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to start your {type} quiz?
            </h2>
            <button
              onClick={generateMockQuiz}
              className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg shadow-lg text-lg"
            >
              Start Quiz
            </button>
          </div>
        )}

        {started && score === null && currentQuestion && (
          <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Question {currentIndex + 1} of {quiz.length}
            </h3>
            <p className="mb-4">{currentQuestion.question}</p>

            {/* Question Type Rendering */}
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

            {(currentQuestion.type === "text" ||
              currentQuestion.type === "voice") && (
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
                  onClick={handleSubmitQuiz}
                  className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg shadow"
                >
                  Submit Quiz
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
                      `${JSON.parse(localStorage.getItem("user") || "")?.name}`,
                      type,
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
