"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Question } from "@prisma/client";
import { toast } from "sonner";

import { createQuestion, updateQuestion } from "@/actions/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseQuestionOptions } from "@/lib/questions";

type FormErrors = {
  question?: string;
  options?: string;
  correctAnswer?: string;
  points?: string;
};

type QuestionFormProps = {
  question?: Question;
};

const getExistingOptions = (question?: Question) => {
  if (!question) return ["", "", "", ""];
  const parsed = parseQuestionOptions(question.options);
  return [...parsed, "", "", "", ""].slice(0, 4);
};

export const QuestionForm = ({ question }: QuestionFormProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(question?.isActive ?? true);
  const [errors, setErrors] = useState<FormErrors>({});
  const existingOptions = getExistingOptions(question);
  
  // Find which option index is the correct answer (for editing)
  const getInitialCorrectIndex = () => {
    if (!question) return -1;
    const options = parseQuestionOptions(question.options);
    const index = options.findIndex((opt) => opt === question.correctAnswer);
    return index >= 0 ? index : -1;
  };
  
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(getInitialCorrectIndex());
  
  // Update correct answer index when editing and option values change
  const handleOptionChange = (idx: number) => {
    if (errors.options || errors.correctAnswer) {
      setErrors({ ...errors, options: undefined, correctAnswer: undefined });
    }
    // If the currently selected correct answer option is being edited,
    // we keep the selection (the user is just updating the text)
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: FormErrors = {};
    const questionText = (formData.get("question") as string)?.trim();
    const allOptions = [
      formData.get("option1"),
      formData.get("option2"),
      formData.get("option3"),
      formData.get("option4")
    ].map((opt) => String(opt).trim());
    const options = allOptions.filter(Boolean);
    const points = Number(formData.get("points") ?? 10);

    if (!questionText || questionText.length < 5) {
      newErrors.question = "คำถามต้องมีอย่างน้อย 5 ตัวอักษร";
    }

    if (options.length < 2) {
      newErrors.options = "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก";
    }

    if (correctAnswerIndex < 0 || correctAnswerIndex >= allOptions.length) {
      newErrors.correctAnswer = "กรุณาเลือกคำตอบที่ถูกต้อง";
    } else {
      const selectedOption = allOptions[correctAnswerIndex];
      if (!selectedOption || !selectedOption.trim()) {
        newErrors.correctAnswer = "ตัวเลือกที่เลือกเป็นคำตอบที่ถูกต้องต้องไม่ว่าง";
      } else if (!options.includes(selectedOption)) {
        // This shouldn't happen, but just in case
        newErrors.correctAnswer = "คำตอบที่ถูกต้องต้องเป็นหนึ่งในตัวเลือก";
      }
    }

    if (points < 1 || points > 100) {
      newErrors.points = "คะแนนต้องอยู่ระหว่าง 1-100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (formData: FormData) => {
    if (!validateForm(formData)) {
      toast.error("กรุณาตรวจสอบข้อมูลให้ถูกต้อง");
      return;
    }

    // Get all options (including empty ones) to preserve indices
    const allOptions = [
      formData.get("option1"),
      formData.get("option2"),
      formData.get("option3"),
      formData.get("option4")
    ].map((option) => String(option).trim());
    
    // Get the correct answer from the original position before filtering
    const correctAnswer = allOptions[correctAnswerIndex] || "";
    
    // Filter out empty options for the final options array
    const options = allOptions.filter(Boolean);

    const payload = {
      question: (formData.get("question") as string).trim(),
      options,
      correctAnswer,
      difficulty: (formData.get("difficulty") as string) ?? "medium",
      category: (formData.get("category") as string)?.trim() || undefined,
      points: Number(formData.get("points") ?? 10),
      isActive: formData.get("isActive") === "on"
    };

    startTransition(async () => {
      try {
        if (question) {
          await updateQuestion(question.id, payload);
          toast.success("อัปเดตคำถามแล้ว");
        } else {
          await createQuestion(payload);
          toast.success("สร้างคำถามแล้ว");
        }
        router.push("/admin/questions");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("ไม่สามารถบันทึกคำถามได้");
      }
    });
  };

  return (
    <motion.form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(new FormData(event.currentTarget));
      }}
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <Label htmlFor="question" className="text-lg font-semibold text-white">
          คำถาม
        </Label>
        <Textarea
          id="question"
          name="question"
          defaultValue={question?.question}
          required
          placeholder="ใส่คำถามที่นี่..."
          className={`min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 ${
            errors.question ? "border-red-400" : ""
          }`}
          onChange={() => {
            if (errors.question) {
              setErrors({ ...errors, question: undefined });
            }
          }}
        />
        {errors.question && (
          <p className="text-sm text-red-300">{errors.question}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold text-white">
          ตัวเลือกและคำตอบที่ถูกต้อง
        </Label>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`relative flex items-center gap-4 rounded-xl border-2 p-5 transition-all duration-200 ${
                correctAnswerIndex === idx
                  ? "border-green-400 bg-green-500/20 shadow-lg shadow-green-500/20"
                  : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
              } ${errors.correctAnswer && idx === correctAnswerIndex ? "border-red-400" : ""}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input
                  type="radio"
                  id={`correct-${idx}`}
                  name="correctAnswer"
                  value={idx}
                  checked={correctAnswerIndex === idx}
                  onChange={(e) => {
                    setCorrectAnswerIndex(Number(e.target.value));
                    if (errors.correctAnswer) {
                      setErrors({ ...errors, correctAnswer: undefined });
                    }
                  }}
                  className="h-5 w-5 text-green-400 focus:ring-green-400 focus:ring-2 cursor-pointer flex-shrink-0"
                />
                <Label
                  htmlFor={`correct-${idx}`}
                  className="text-white/60 text-sm font-medium flex-shrink-0 cursor-pointer"
                >
                  {String(idx + 1).padStart(2, "0")}
                </Label>
                <Input
                  id={`option${idx + 1}`}
                  name={`option${idx + 1}`}
                  defaultValue={existingOptions[idx]}
                  required
                  placeholder={`ใส่ตัวเลือก ${idx + 1}`}
                  className={`flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    errors.options ? "text-red-300" : ""
                  }`}
                  onChange={() => handleOptionChange(idx)}
                />
              </div>
              {correctAnswerIndex === idx && (
                <div className="flex-shrink-0">
                  <Badge className="bg-green-500 text-white border-0 shadow-md">
                    ✓ คำตอบที่ถูกต้อง
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
        {errors.options && (
          <p className="text-sm text-red-300">{errors.options}</p>
        )}
        {errors.correctAnswer && (
          <p className="text-sm text-red-300">{errors.correctAnswer}</p>
        )}
        <p className="text-xs text-white/50 italic">
          💡 คลิกที่วงกลมด้านซ้ายเพื่อเลือกคำตอบที่ถูกต้อง
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-white">
            หมวดหมู่ (ไม่บังคับ)
          </Label>
          <Input
            id="category"
            name="category"
            defaultValue={question?.category ?? ""}
            placeholder="เล่นคำ"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-white">ความยาก</Label>
          <Select defaultValue={question?.difficulty ?? "medium"} name="difficulty">
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="ความยาก" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="easy" className="text-white">ง่าย</SelectItem>
              <SelectItem value="medium" className="text-white">ปานกลาง</SelectItem>
              <SelectItem value="hard" className="text-white">ยาก</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points" className="text-white">คะแนน</Label>
          <Input
            id="points"
            name="points"
            type="number"
            min={1}
            max={100}
            defaultValue={question?.points ?? 10}
            className={`bg-white/5 border-white/20 text-white ${
              errors.points ? "border-red-400" : ""
            }`}
            onChange={() => {
              if (errors.points) {
                setErrors({ ...errors, points: undefined });
              }
            }}
          />
          {errors.points && (
            <p className="text-sm text-red-300">{errors.points}</p>
          )}
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/5 p-4">
          <Label htmlFor="isActive" className="text-white">เปิดใช้งาน?</Label>
          <input type="hidden" name="isActive" value={isActive ? "on" : "off"} />
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
        >
          {pending ? "กำลังบันทึก..." : question ? "อัปเดตคำถาม" : "สร้างคำถาม"}
        </Button>
      </div>
    </motion.form>
  );
};

