"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteQuestion } from "@/actions/questions";
import { Button, type ButtonProps } from "@/components/ui/button";

type DeleteQuestionButtonProps = {
  questionId: string;
  onDelete?: () => void;
} & ButtonProps;

export const DeleteQuestionButton = ({ questionId, onDelete, children, ...props }: DeleteQuestionButtonProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        if (!confirm("ลบคำถามนี้?")) return;
        startTransition(async () => {
          try {
            await deleteQuestion(questionId);
            toast.success("ลบคำถามแล้ว");
            onDelete?.();
            router.refresh();
          } catch {
            toast.error("ลบคำถามไม่สำเร็จ");
          }
        });
      }}
    >
      {pending ? "กำลังลบ..." : children}
    </Button>
  );
};

