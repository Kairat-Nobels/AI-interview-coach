import { useState, useEffect } from 'react';
import { Code, Play, RotateCcw, CheckCircle, ArrowLeft } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";

function App() {

  const [aiReady, setAiReady] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [code, setCode] = useState(`function solution() {\n // Ваш код здесь\n}`);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [solved, setSolved] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300)
    return () => clearInterval(checkReady);
  }, []);

  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    if (warning) setWarning("");

  }

  const generateQuestion = async () => {
    const validLevels = ["Начальный", "Средний", "Продвинутый"];

    if (!validLevels.includes(difficulty)) {
      setWarning("⚠ Пожалуйста, сначала выбери сложность.");
      return;
    }

    setWarning("");
    setLoading(true);
    setFeedback("");
    setSolved(false);
    setCode(`function solution() {\n // Ваш код здесь\n}`);
    setQuestionData(null);

    try {
      const res = await window.puter.ai.chat(
        `
      Сгенерируй случайную задачу по программированию уровня "${difficulty}" 
      в стиле LeetCode.

      Верни ТОЛЬКО корректный JSON без пояснений и лишнего текста 
      в следующем формате:

      {
        "problem": "Текст условия задачи",
        "example": "Пример входа и выхода с пояснением",
        "constraints": "Ограничения (каждое с новой строки)",
        "note": "Примечание или пустая строка, если его нет"
      }

      Никакого дополнительного текста вне JSON.
    `
      );

      const reply = typeof res === "string" ? res : res.message?.content || "";
      const parsed = JSON.parse(reply);

      setQuestionData(parsed);
    } catch (error) {
      setFeedback(`❌ Ошибка: ${error.message}`);
    }
    setLoading(false);
  }

  const normalizeText = (s = "") =>
    String(s)
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .trim();

  const checkSolution = async () => {
    if (!code.trim()) return;
    setLoading(true);

    try {
      const res = await window.puter.ai.chat(
        `
          Ты опытный наставник по подготовке к техническим интервью.
          Условие задачи:
          "${questionData?.problem}"
          Решение кандидата:
          ${code}
          Правила ответа:
          1. Если решение полностью корректное — напиши:
            "✅ Верно! Отличная работа."
          2. Если решение неверное — дай полезные подсказки,
            укажи на ошибки или недочёты,
            но НЕ раскрывай полное правильное решение.
          Ответ должен быть только текстом без лишних комментариев.
        `
      )

      const reply = typeof res === "string" ? res : res.message?.content || "";
      setFeedback(reply);
      if (reply.includes("✅ Верно")) setSolved(true);

    } catch (error) {
      setFeedback(`❌ Ошибка: ${error.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-slate-950 to-emerald-900 flex flex-col items-center justify-center p-6 gap-10">
      <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-clip-text text-transparent text-center">AI Interview Coach</h1>

      <div className='w-full max-w-7xl flex flex-col items-center justify-center'>
        {!questionData ? (
          <div className='w-full max-w-md p-10 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-3xl shadow-lg shadow-sky-600 hover:shadow-2xl hover:shadow-sky-400 transition duration-300 text-center'>
            <Code className='mx-auto mb-6 text-cyan-400 w-24 h-24' />
            <h2 className='text-3xl font-semibold text-white mb-4'>Готов потренироваться?</h2>
            <p className='text-slate-300 mb-8 text-lg leading-relaxed'>Решай задачи, сгенерированные ИИ, получай подсказки и прокачивай навыки.</p>

            <div className='mb-8'>
              <p className='text-sky-400 mb-4 text-lg font-semibold text-center'>Выберите сложность:</p>
              <div className='flex justify-center gap-3 flex-wrap sm:flex-nowrap'>
                {["Начальный", "Средний", "Продвинутый"].map((level) => (
                  <button key={level} onClick={() => handleDifficultySelect(level)}
                    className={`px-6 py-3 rounded-full font-semibold transition-colors duration-200 cursor-pointer ${difficulty === level ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >{level}</button>
                ))}
              </div>
            </div>
            {warning && (
              <p className='text-red-500 font-semibold mb-4'>{warning}</p>
            )}
            <button onClick={generateQuestion} disabled={!aiReady || loading}
              className='w-full px-10 py-4 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white font-semibold text-lg rounded-3xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
              {loading ? "Генерация..." : "Сгенерировать задачу"}
            </button>
          </div>
        ) : (
          <div className='space-y-6 w-full'>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='bg-gradient-to-br from-blue-950/40 to-sky-950/50 backdrop-blur-sm border border-indigo-400/30 rounded-2xl shadow-2xl p-8 space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold text-emerald-300 mb-1'>Задача</h3>
                  <p className='text-gray-200'>{questionData.problem}</p>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-emerald-300 mb-1'>Пример</h3>
                  <pre className='bg-black/30 p-3 rounded text-gray-200 whitespace-pre-wrap'>{normalizeText(questionData.example)}</pre>
                </div>

                <div>
                  <h3 className='text-lg font-semibold text-emerald-300 mb-1'>Ограничения</h3>
                  <ul className='list-disc list-inside text-gray-200'>{normalizeText(questionData.constraints)
                    .split(/\n+/)
                    .filter(Boolean)
                    .map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}</ul>
                </div>

                {questionData.note && (
                  <div>
                    <h3 className='text-lg font-semibold text-emerald-300 mb-1'>Примечание</h3>
                    <p className='text-gray-200'>{questionData.note}</p>
                  </div>
                )}

                <div className='bg-gray-800/60 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden'>
                  <div className='bg-gray-900/90 px-4 py-3 border-b border-gray-700/50 flex items-center gap-3'>
                    <Code className='w-5 h-5 text-emerald-400' />
                    <h3 className='text-lg font-semibold text-white'>Решение</h3>
                  </div>
                  <CodeMirror value={code} height='550px' extensions={[javascript({ jsx: true })]}
                    theme={dracula} onChange={(value) => setCode(value)}
                  />
                </div>
              </div>

              <div className='flex gap-6 lg:gap-10 justify-center items-center flex-col lg:flex-row'>
                <div className='flex flex-wrap gap-3 justify-center items-center'>
                  <button onClick={checkSolution} disabled={loading || !aiReady || !code.trim()} className='px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:opacity-80 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer'>
                    <Play className='w-5 h5' />
                    {loading ? "Проверяю..." : "Проверить решение"}
                  </button>

                  <button onClick={generateQuestion} disabled={loading || !aiReady} className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-80 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer'>
                    <RotateCcw className='w-5 h5' />
                    {loading ? "Генерация..." : "Новая задача"}
                  </button>

                  <button onClick={() => {
                    setQuestionData(null);
                    setCode(`function solution() {\n // Ваш код здесь\n}`);
                    setFeedback("");
                    setSolved(false);
                    setDifficulty(null);
                    setWarning("");
                    setLoading(false);
                  }} disabled={loading} className='px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:opacity-80 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer'>
                    <ArrowLeft className='w-5 h5' />
                    Назад
                  </button>
                </div>

                <div className='flex gap-3 flex-wrap items-center'>
                  <p className='text-slate-300 font-semibold'>Сложность:</p>
                  {["Начальный", "Средний", "Продвинутый"].map((level) => (
                    <button key={level} onClick={() => handleDifficultySelect(level)}
                      className={`px-4 py-3 rounded-full font-semibold transition-colors duration-200 cursor-pointer ${difficulty === level ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >{level}</button>
                  ))}
                </div>
              </div>
              {feedback && (
                <div className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm ${feedback.includes("✅") ? "bg-green-900/40 border border-green-500/30" : feedback.includes("❌") ? "bg-red-900/40 border border-red-500/30" : "bg-gray-800/60 border border-gray-700/50"}`}>
                  <div className='flex items-start gap-4'>
                    <CheckCircle className={`w-6 h-6 ${feedback.includes("✅") ? "text-green-400" : feedback.includes("❌") ? "text-red-400" : "text-blue-400"}`} />
                    <div className='flex-1 text-gray-200 whitespace-pre-wrap leading-relaxed'>{feedback}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
