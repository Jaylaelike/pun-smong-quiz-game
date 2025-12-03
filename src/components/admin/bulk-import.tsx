"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createQuestion } from "@/actions/questions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const BulkImport = () => {
  const [pending, startTransition] = useTransition();

  const handleImport = (formData: FormData) => {
    const raw = formData.get("payload") as string;
    if (!raw) return;

    startTransition(async () => {
      try {
        const parsed = JSON.parse(raw) as Array<{
          question: string;
          options: string[];
          correctAnswer: string;
          difficulty: string;
          category?: string;
          points?: number;
          isActive?: boolean;
        }>;

        await Promise.all(
          parsed.map((entry) =>
            createQuestion({
              question: entry.question,
              options: entry.options,
              correctAnswer: entry.correctAnswer,
              difficulty: entry.difficulty,
              category: entry.category,
              points: entry.points ?? 10,
              isActive: entry.isActive ?? true
            })
          )
        );

        toast.success(`นำเข้า ${parsed.length} คำถามแล้ว`);
      } catch (error) {
        console.error(error);
        toast.error("ข้อมูล JSON ไม่ถูกต้อง");
      }
    });
  };

  return (
    <form
      className="space-y-3 rounded-2xl border bg-muted/30 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        handleImport(new FormData(event.currentTarget));
      }}
    >
      <Label htmlFor="payload">นำเข้า JSON จำนวนมาก</Label>
      <Textarea id="payload" name="payload" placeholder='[{"question":"คำถาม?","options":["A","B","C","D"],"correctAnswer":"A","difficulty":"easy"}]' rows={6} />
      <Button type="submit" disabled={pending}>
        {pending ? "กำลังนำเข้า..." : "นำเข้า"}
      </Button>
    </form>
  );
};

