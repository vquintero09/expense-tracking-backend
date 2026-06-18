const PG_UNIQUE_VIOLATION = "23505";

export const isUniqueViolation = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === PG_UNIQUE_VIOLATION
  );
};
