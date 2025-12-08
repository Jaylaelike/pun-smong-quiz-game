"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Question } from "@prisma/client";
import { toast } from "sonner";

import { submitAnswer } from "@/actions/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTION_DURATION_MS } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { parseQuestionOptions } from "@/lib/questions";

type QuizClientProps = {
  initialQuestion: Question | null;
  stats: {
    answered: number;
    total: number;
    score: number;
  };
};

type AnswerState = {
  isCorrect: boolean;
  score: number;
  correctAnswer: string;
} | null;

const getOptionList = (question: Question | null) => {
  if (!question) return [];
  return parseQuestionOptions(question.options);
};

const optionNumber = (index: number) => String(index + 1).padStart(2, "0");

export const QuizClient = ({ initialQuestion, stats }: QuizClientProps) => {
  const router = useRouter();
  const [question, setQuestion] = useState(initialQuestion);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_MS);
  const [answering, startTransition] = useTransition();
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    setQuestion(initialQuestion);
    setTimeLeft(QUESTION_DURATION_MS);
    setAnswerState(null);
    setHasSubmitted(false);
    if (!initialQuestion) {
      // Reset correct answers when starting a new quiz session
      setCorrectAnswers(0);
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (!question || answerState || hasSubmitted) return;
    if (timeLeft <= 0) {
      handleSubmit("Timeout");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1000);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, question, answerState]);

  const optionList = useMemo(() => getOptionList(question), [question]);
  const timerPercent = useMemo(() => Math.max((timeLeft / QUESTION_DURATION_MS) * 100, 0), [timeLeft]);

  const handleSubmit = useCallback(
    (answer: string) => {
      if (!question || hasSubmitted) return;
      setHasSubmitted(true);
      startTransition(async () => {
        const response = await submitAnswer({
          questionId: question.id,
          answer,
          responseTime: QUESTION_DURATION_MS - timeLeft
        });

        if ("error" in response) {
          toast.error(response.error);
          setHasSubmitted(false);
          return;
        }

        setAnswerState({
          isCorrect: response.isCorrect,
          score: response.score,
          correctAnswer: response.correctAnswer
        });
        if (response.isCorrect) {
          setCorrectAnswers(prev => prev + 1);
        }
        toast.success(response.isCorrect ? "ถูกต้อง! 🎉" : "คำตอบผิด", {
          description: response.isCorrect ? `+${response.score} คะแนน` : `คำตอบที่ถูกต้อง: ${response.correctAnswer}`
        });

        setTimeout(() => {
          router.refresh();
        }, 1200);
      });
    },
    [hasSubmitted, question, router, startTransition, timeLeft]
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!question || hasSubmitted || answerState) return;
      const key = event.key;
      // Support both number keys (1-4) and number pad (1-4)
      const optionIndex = key >= "1" && key <= "4" ? Number(key) - 1 : -1;
      const option = optionList[optionIndex];
      if (option) {
        event.preventDefault();
        handleSubmit(option);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [answerState, handleSubmit, hasSubmitted, optionList, question]);

  if (!question) {
    const totalQuestions = stats.total;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return (
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Results</h1>
          <p className="text-lg text-white/80">Total correct answers</p>
          <p className="text-xl text-white/70">{correctAnswers} out of {totalQuestions} Questions</p>
        </div>
        
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-pulse"
                style={{
                  left: `${50 + 30 * Math.cos((i * 2 * Math.PI) / 20)}%`,
                  top: `${50 + 30 * Math.sin((i * 2 * Math.PI) / 20)}%`,
                  backgroundColor: ['#a855f7', '#f97316', '#3b82f6', '#10b981'][i % 4],
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl border-8 border-yellow-300">
            <span className="text-6xl md:text-7xl font-bold text-gray-900">{percentage}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg text-white/80">Your final score is</p>
          <p className="text-4xl font-bold text-white">{stats.score}</p>
        </div>
        
        <Button 
          onClick={() => router.push("/leaderboard")} 
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 px-8 shadow-xl"
        >
          <span className="mr-2">🔄</span>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-300 mb-1">คะแนนรวม</p>
            <p className="text-3xl font-bold text-white">{stats.score}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-300 mb-1">ความคืบหน้า</p>
            <p className="text-2xl font-bold text-white">
              {stats.answered}/{stats.total}
            </p>
          </div>
        </div>
      </div>
      <Card className="overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-lg relative shadow-xl">
        <AnimatePresence>
          {answerState?.isCorrect && (
              <motion.div
              key="confetti"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="rounded-full bg-green-100/70 px-4 py-1 text-sm font-semibold text-green-700 shadow">
                ถูกต้อง! +{answerState.score} คะแนน
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardDescription className="text-lg font-semibold text-white">
              Level {question.difficulty === "easy" ? "1" : question.difficulty === "medium" ? "2" : "3"}
            </CardDescription>
            <CardDescription className="text-lg font-semibold text-white">
              {stats.answered + 1}/{stats.total}
            </CardDescription>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-white font-bold leading-tight">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className={cn("flex items-center justify-between text-sm font-medium text-white", timerPercent < 35 && "text-orange-300", timerPercent < 20 && "text-red-300")}>
              <span>เวลาที่เหลือ</span>
              <span className="font-bold">{Math.max(Math.ceil(timeLeft / 1000), 0)}s</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
              <div className={cn(
                "h-full rounded-full transition-all",
                timerPercent > 50 ? "bg-gradient-to-r from-emerald-400 to-green-500" :
                timerPercent > 20 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                "bg-gradient-to-r from-rose-400 to-red-500"
              )} style={{ width: `${timerPercent}%` }} />
            </div>
          </div>
          <div className="grid gap-4">
            <AnimatePresence mode="wait">
              {optionList.map((option, index) => {
                const isCorrectAnswer = answerState?.correctAnswer === option;
                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSubmit(option)}
                    disabled={answering || !!answerState}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border-2 p-5 text-left transition focus:outline-none focus-visible:ring-2",
                      answerState
                        ? isCorrectAnswer
                          ? "border-green-400 bg-green-500/40 text-white animate-correct-flash shadow-lg shadow-green-500/30"
                          : "border-red-400/50 bg-red-500/20 text-white animate-shake-wrong"
                        : "border-white/20 bg-white/5 text-white hover:border-purple-400 hover:bg-purple-500/20 hover:scale-[1.02]"
                    )}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 text-base font-bold text-white backdrop-blur flex-shrink-0">
                      {optionNumber(index)}
                    </span>
                    <span className="text-lg font-medium flex-1">{option}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-6">
          {answerState ? (
            <div className="flex items-center justify-between w-full gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => router.refresh()} 
                className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20 text-base py-6"
              >
                Previous
              </Button>
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => router.refresh()} 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-base py-6"
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="w-full text-center">
              <p className="text-white/70 text-sm">ตอบได้ครั้งเดียว — โบนัสขึ้นอยู่กับความเร็ว</p>
              {answering && (
                <div className="mt-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

