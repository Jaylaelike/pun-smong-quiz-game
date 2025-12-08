"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, PlusCircle, Trash, Search, Filter, X } from "lucide-react";
import type { Question } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteQuestionButton } from "@/components/admin/delete-question-button";
import { parseQuestionOptions } from "@/lib/questions";

type QuestionsListProps = {
  initialQuestions: Question[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export const QuestionsList = ({ initialQuestions, initialPagination }: QuestionsListProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [questions, setQuestions] = useState(initialQuestions);
  const [pagination, setPagination] = useState(initialPagination);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "points" | "difficulty">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSearch = () => {
    startTransition(async () => {
      const params = new URLSearchParams({
        page: "1",
        ...(search && { search }),
        ...(difficulty !== "all" && { difficulty }),
        ...(isActive !== "all" && { isActive: isActive === "true" ? "true" : "false" }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/questions?${params}`);
      const data = await response.json();
      setQuestions(data.questions);
      setPagination(data.pagination);
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(async () => {
      const params = new URLSearchParams({
        page: newPage.toString(),
        ...(search && { search }),
        ...(difficulty !== "all" && { difficulty }),
        ...(isActive !== "all" && { isActive: isActive === "true" ? "true" : "false" }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/questions?${params}`);
      const data = await response.json();
      setQuestions(data.questions);
      setPagination(data.pagination);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const clearFilters = () => {
    setSearch("");
    setDifficulty("all");
    setIsActive("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    router.refresh();
  };

  const hasActiveFilters = search || difficulty !== "all" || isActive !== "all";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase text-purple-300">คลังคำถาม</p>
          <h1 className="text-3xl font-bold text-white">จัดการคำถาม</h1>
          <p className="text-sm text-white/70 mt-1">
            ทั้งหมด {pagination.total} คำถาม
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
          <Link href="/admin/questions/new">
            <PlusCircle className="mr-2 h-4 w-4" /> คำถามใหม่
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="h-4 w-4" />
            ค้นหาและกรอง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="ค้นหาคำถาม..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Button onClick={handleSearch} disabled={pending} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              ค้นหา
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} disabled={pending} className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                <X className="mr-2 h-4 w-4" />
                ล้าง
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">ความยาก</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="easy">ง่าย</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="hard">ยาก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">สถานะ</label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="all" className="text-white">ทั้งหมด</SelectItem>
                  <SelectItem value="true" className="text-white">เปิดใช้งาน</SelectItem>
                  <SelectItem value="false" className="text-white">ปิดใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">เรียงตาม</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="createdAt" className="text-white">วันที่สร้าง</SelectItem>
                  <SelectItem value="updatedAt" className="text-white">วันที่อัปเดต</SelectItem>
                  <SelectItem value="points" className="text-white">คะแนน</SelectItem>
                  <SelectItem value="difficulty" className="text-white">ความยาก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">ลำดับ</label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="desc" className="text-white">มาก → น้อย</SelectItem>
                  <SelectItem value="asc" className="text-white">น้อย → มาก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {pending && questions.length === 0 ? (
        <div className="text-center py-12 text-white/70">กำลังโหลด...</div>
      ) : questions.length === 0 ? (
        <Card className="border-white/20 bg-white/10 backdrop-blur-lg">
          <CardContent className="py-12 text-center text-white/70">
            ไม่พบคำถามที่ตรงกับเงื่อนไข
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {questions.map((question) => {
              const options = parseQuestionOptions(question.options);
              return (
                <Card key={question.id} className="border-white/20 bg-white/10 backdrop-blur-lg hover:bg-white/15 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg text-white">{question.question}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-white/20 text-white/80">ความยาก: {question.difficulty}</Badge>
                        <Badge variant="outline" className="border-white/20 text-white/80">คะแนน: {question.points}</Badge>
                        {question.category && (
                          <Badge variant="secondary" className="bg-purple-500/30 text-white">{question.category}</Badge>
                        )}
                        <Badge variant={question.isActive ? "default" : "secondary"} className={question.isActive ? "bg-green-500/30 text-white" : "bg-gray-500/30 text-white/70"}>
                          {question.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                        <Link href={`/admin/questions/${question.id}`}>
                          <Pencil className="mr-1 h-4 w-4" /> แก้ไข
                        </Link>
                      </Button>
                      <DeleteQuestionButton
                        questionId={question.id}
                        variant="destructive"
                        size="sm"
                        onDelete={() => {
                          setQuestions(questions.filter((q) => q.id !== question.id));
                          setPagination({
                            ...pagination,
                            total: pagination.total - 1
                          });
                        }}
                      >
                        <Trash className="mr-1 h-4 w-4" /> ลบ
                      </DeleteQuestionButton>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white/70">
                    {options.map((option, idx) => (
                      <p key={idx}>
                        {option}{" "}
                        {option === question.correctAnswer && (
                          <span className="text-green-300 font-medium">(ถูกต้อง)</span>
                        )}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pending || pagination.page === 1}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                ก่อนหน้า
              </Button>
              <div className="text-sm text-white/70">
                หน้า {pagination.page} จาก {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pending || !pagination.hasMore}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                ถัดไป
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

