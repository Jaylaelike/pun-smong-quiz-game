"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { resetRewards } from "@/actions/admin";
import { Button, type ButtonProps } from "@/components/ui/button";

type ResetRewardsButtonProps = ButtonProps;

export const ResetRewardsButton = ({ children, ...props }: ResetRewardsButtonProps) => {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("รีเซ็ตรางวัลและคะแนนของผู้เล่นทั้งหมด? การกระทำนี้ไม่สามารถยกเลิกได้")) return;

    startTransition(async () => {
      try {
        await resetRewards({ clearHistory: true });
        toast.success("รีเซ็ตรางวัลและคะแนนทั้งหมดแล้ว");
      } catch (error) {
        console.error(error);
        toast.error("รีเซ็ตรางวัลไม่สำเร็จ");
      }
    });
  };

  return (
    <Button {...props} disabled={pending || props.disabled} onClick={handleClick}>
      {pending ? "กำลังรีเซ็ต..." : children}
    </Button>
  );
};


