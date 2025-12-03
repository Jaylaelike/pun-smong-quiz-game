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

const optionLetter = (index: number) => String.fromCharCode(65 + index);

export const QuizClient = ({ initialQuestion, stats }: QuizClientProps) => {
  const router = useRouter();
  const [question, setQuestion] = useState(initialQuestion);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_MS);
  const [answering, startTransition] = useTransition();
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setQuestion(initialQuestion);
    setTimeLeft(QUESTION_DURATION_MS);
    setAnswerState(null);
    setHasSubmitted(false);
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
      const key = event.key.toLowerCase();
      const optionIndex =
        key >= "1" && key <= "4"
          ? Number(key) - 1
          : key >= "a" && key <= "d"
            ? key.charCodeAt(0) - 97
            : -1;
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
    return (
      <Card className="mx-auto mt-12 max-w-2xl text-center">
        <CardHeader>
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>ตอบครบทุกข้อแล้ว!</CardTitle>
          <CardDescription>ไม่มีคำถามเหลือแล้ว กลับมาดูใหม่เร็วๆ นี้เพื่อเล่นต่อ</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={() => router.push("/leaderboard")} variant="outline">
            ดูกระดานคะแนน
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-white/70 bg-white/90 px-6 py-4 shadow">
        <div className="grid gap-4 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid-cols-3">
          <div>
            <p className="text-[11px] text-slate-500">คะแนนรวม</p>
            <p className="text-2xl font-semibold text-primary">{stats.score}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">ความคืบหน้า</p>
            <p className="text-lg text-gray-900">
              {stats.answered}/{stats.total}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">ปุ่มลัด</p>
            <p className="text-gray-900">กด 1-4 หรือ A-D เพื่อตอบ</p>
          </div>
        </div>
      </div>
      <Card className="overflow-hidden border-2 relative">
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
          <CardDescription className="flex items-center justify-between text-sm font-medium">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">หมวดหมู่ · {question.category ?? "ทั่วไป"}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">ความยาก · {question.difficulty}</span>
          </CardDescription>
          <CardTitle className="text-3xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className={cn("flex items-center justify-between text-sm font-medium text-slate-600", timerPercent < 35 && "text-orange-500", timerPercent < 20 && "text-red-500")}>
              <span>เวลาที่เหลือ</span>
              <span>{Math.max(Math.ceil(timeLeft / 1000), 0)}s</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400 transition-all" style={{ width: `${timerPercent}%` }} />
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
                      "flex items-center gap-4 rounded-2xl border p-4 text-left text-lg font-medium transition focus:outline-none focus-visible:ring-2",
                      answerState
                        ? isCorrectAnswer
                          ? "border-green-400 bg-green-50 animate-correct-flash"
                          : "border-destructive/50 animate-shake-wrong"
                        : "hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">{optionLetter(index)}</span>
                    <span>{option}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            {answerState ? (
              <p className="font-medium text-gray-700">
                {answerState.isCorrect ? "คำตอบถูกต้อง" : "คำตอบผิด"} · +{answerState.score} คะแนน
              </p>
            ) : (
              <p>ตอบได้ครั้งเดียว — โบนัสขึ้นอยู่กับความเร็ว</p>
            )}
            {answerState && (
              <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                คำถามถัดไป
              </Button>
            )}
          </div>
          {answering && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </CardFooter>
      </Card>
    </div>
  );
};

