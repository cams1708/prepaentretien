export type ActionFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_FORM_STATE: ActionFormState = { status: "idle" };
