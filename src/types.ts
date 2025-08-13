export type Field =
  | { id: string; type: "text"; label: string; description?: string; groupId?: string; defaultValue?: string; validationRegex?: string }
  | { id: string; type: "radio"; label: string; description?: string; groupId?: string; options: string[]; defaultValue?: string }
  | { id: string; type: "checkbox"; label: string; description?: string; groupId?: string; options: string[]; defaultValue?: string[]; requiredOptions?: string[]; errorMessage?: string }
  | { id: string; type: "list"; label: string; description?: string; groupId?: string; defaultValue?: string[]; validationRegex?: string }
  | { id: string; type: "map"; label: string; description?: string; groupId?: string; defaultValue?: Record<string, string>; keyValidationRegex?: string; valueValidationRegex?: string };

export type Group = {
  id: string;
  name: string;
  description?: string;
  padding?: boolean; // trueならデフォルトpaddingを付与
};

export type Mode = "admin" | "user";

export type Theme = {
  name: string;
  primaryColor: string;
  lightPrimary: string;
  background: string;
  textColor: string;
};

export const themes: Theme[] = [
  {
    name: "ブルー",
    primaryColor: "#007BFF",
    lightPrimary: "#E6F0FF",
    background: "#f9fbff",
    textColor: "#333",
  },
  {
    name: "グリーン",
    primaryColor: "#28a745",
    lightPrimary: "#E8F6E8",
    background: "#f8fff9",
    textColor: "#2d3e2d",
  },
  {
    name: "ダーク",
    primaryColor: "#4a90e2",
    lightPrimary: "#1c2833",
    background: "#121212",
    textColor: "#ddd",
  },
];
