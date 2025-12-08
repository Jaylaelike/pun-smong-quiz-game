import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { isAdmin } from "@/lib/auth";
import { listQuestions } from "@/actions/questions";
import { QuestionsList } from "@/components/admin/questions-list";
import { BulkImport } from "@/components/admin/bulk-import";

const AdminQuestionsPage = async ({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { userId } = auth();
  if (!userId) redirect("/auth/sign-in");

  const clerkUser = await currentUser();
  if (!isAdmin(clerkUser)) redirect("/dashboard");

  const page = parseInt((searchParams.page as string) || "1", 10);
  const limit = parseInt((searchParams.limit as string) || "20", 10);
  const search = (searchParams.search as string) || "";
  const difficulty = (searchParams.difficulty as string) || undefined;
  const isActiveParam = searchParams.isActive as string;
  const isActive = isActiveParam ? isActiveParam === "true" : undefined;
  const sortBy = (searchParams.sortBy as any) || "createdAt";
  const sortOrder = (searchParams.sortOrder as "asc" | "desc") || "desc";

  const result = await listQuestions({
    page,
    limit,
    search,
    difficulty,
    isActive,
    sortBy,
    sortOrder
  });

  return (
    <div className="space-y-6">
      <QuestionsList
        initialQuestions={result.questions}
        initialPagination={result.pagination}
      />
      <BulkImport />
    </div>
  );
};

export default AdminQuestionsPage;

