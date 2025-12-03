export const parseQuestionOptions = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.filter((option): option is string => typeof option === "string");
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((option): option is string => typeof option === "string");
      }
    } catch {
      // ignore JSON parse errors
    }
  }

  return [];
};

