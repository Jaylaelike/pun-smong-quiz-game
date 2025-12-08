"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { bulkCreateQuestions } from "@/actions/questions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export const BulkImport = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);

  const handleImport = (formData: FormData) => {
    const raw = formData.get("payload") as string;
    if (!raw?.trim()) {
      toast.error("กรุณาใส่ข้อมูล JSON");
      return;
    }

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

        if (!Array.isArray(parsed) || parsed.length === 0) {
          toast.error("ข้อมูลต้องเป็น array ที่ไม่ว่าง");
          return;
        }

        // Validate each question
        const invalid = parsed.findIndex(
          (q) =>
            !q.question ||
            !Array.isArray(q.options) ||
            q.options.length < 2 ||
            !q.correctAnswer ||
            !q.difficulty
        );

        if (invalid !== -1) {
          toast.error(`คำถามที่ ${invalid + 1} ไม่ถูกต้อง`);
          return;
        }

        setProgress(0);
        const result = await bulkCreateQuestions(parsed);
        setProgress(100);

        toast.success(`นำเข้า ${result.length} คำถามสำเร็จ`);
        router.refresh();
        
        // Reset form
        const textarea = document.getElementById("payload") as HTMLTextAreaElement;
        if (textarea) textarea.value = "";
        setProgress(0);
      } catch (error) {
        console.error(error);
        setProgress(0);
        if (error instanceof SyntaxError) {
          toast.error("ข้อมูล JSON ไม่ถูกต้อง");
        } else {
          toast.error("เกิดข้อผิดพลาดในการนำเข้า");
        }
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
      <div className="space-y-2">
        <Label htmlFor="payload">นำเข้า JSON จำนวนมาก</Label>
        <Textarea
          id="payload"
          name="payload"
          placeholder='[{"question":"คำถาม?","options":["A","B","C","D"],"correctAnswer":"A","difficulty":"easy","points":10}]'
          rows={6}
          disabled={pending}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          รองรับการนำเข้าหลายคำถามพร้อมกัน ใช้ transaction เพื่อความปลอดภัยของข้อมูล
        </p>
      </div>
      {progress > 0 && progress < 100 && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">กำลังนำเข้า...</p>
        </div>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "กำลังนำเข้า..." : "นำเข้า"}
      </Button>
    </form>
  );
};

