import { Templates } from "@/types/templates.ts";

export const getTemplates = async () => {
  const response = await fetch("/api/project/templates");
  return (await response.json()) as Templates;
};
