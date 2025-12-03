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
import { parseQuestionOptions } from "@/lib/questions";

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
  const existingOptions = getExistingOptions(question);

  const handleSubmit = (formData: FormData) => {
    const payload = {
      question: formData.get("question") as string,
      options: [
        formData.get("option1"),
        formData.get("option2"),
        formData.get("option3"),
        formData.get("option4")
      ].map((option) => String(option)),
      correctAnswer: formData.get("correctAnswer") as string,
      difficulty: (formData.get("difficulty") as string) ?? "medium",
      category: formData.get("category") as string,
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
    <motion.form onSubmit={(event) => { event.preventDefault(); handleSubmit(new FormData(event.currentTarget)); }} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">คำถาม</Label>
        <Textarea id="question" name="question" defaultValue={question?.question} required placeholder="ใส่คำถาม" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((idx) => (
          <div className="space-y-2" key={idx}>
            <Label htmlFor={`option${idx + 1}`}>ตัวเลือก {idx + 1}</Label>
            <Input id={`option${idx + 1}`} name={`option${idx + 1}`} defaultValue={existingOptions[idx]} required />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">คำตอบที่ถูกต้อง</Label>
          <Input id="correctAnswer" name="correctAnswer" defaultValue={question?.correctAnswer} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">หมวดหมู่</Label>
          <Input id="category" name="category" defaultValue={question?.category ?? ""} placeholder="เล่นคำ" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>ความยาก</Label>
          <Select defaultValue={question?.difficulty ?? "medium"} name="difficulty">
            <SelectTrigger>
              <SelectValue placeholder="ความยาก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">ง่าย</SelectItem>
              <SelectItem value="medium">ปานกลาง</SelectItem>
              <SelectItem value="hard">ยาก</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">คะแนน</Label>
          <Input id="points" name="points" type="number" min={1} defaultValue={question?.points ?? 10} />
        </div>
        <div className="flex items-center justify-between rounded-xl border p-4">
          <Label htmlFor="isActive">เปิดใช้งาน?</Label>
          <input type="hidden" name="isActive" value={isActive ? "on" : "off"} />
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "กำลังบันทึก..." : question ? "อัปเดตคำถาม" : "สร้างคำถาม"}
      </Button>
    </motion.form>
  );
};

