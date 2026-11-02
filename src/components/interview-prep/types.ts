export type Message = { role: "user" | "assistant"; content: string };

export type StudentForm = {
  firstName: string;
  headline: string;
  degree: string;
  currentYear: string;
  skills: string;
  experiences: string;
};

export const EMPTY_STUDENT: StudentForm = {
  firstName: "",
  headline: "",
  degree: "",
  currentYear: "",
  skills: "",
  experiences: "",
};
