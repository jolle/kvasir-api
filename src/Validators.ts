export const isValidCourseId = (id: string) =>
  /[A-Za-zäöåÄÖÅ][A-Za-zäöåÄÖÅ0-9]{1,9}[0-9]{0,4}-([0-9A-Z]{1,4}|[A-Za-zäöåÄÖÅ\s]+)/.test(
    id
  );
