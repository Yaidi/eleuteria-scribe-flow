import { Templates } from "@/types/templates.ts";

export const getTemplates = async () => {
  const response = await fetch(`${host}/project/templates`);
  return (await response.json()) as Templates;
};
export const host = import.meta.env.DEV ? "/api" : "http://127.0.0.1:8000";
