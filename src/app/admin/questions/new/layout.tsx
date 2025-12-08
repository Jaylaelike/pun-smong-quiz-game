import type { ReactNode } from "react";

type AdminQuestionLayoutProps = {
  children: ReactNode;
};

const AdminQuestionLayout = ({ children }: AdminQuestionLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden -mt-10 -mx-4 md:-mx-8 lg:-mx-16">
      {/* Subtle light speckles effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: "0s" }} />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-white rounded-full blur-sm animate-pulse" style={{ animationDelay: "2.5s" }} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AdminQuestionLayout;

