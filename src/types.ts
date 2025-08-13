export type Field =
  | { id: string; type: "text"; label: string; defaultValue?: string; validationRegex?: string }
  | { id: string; type: "radio"; label: string; options: string[]; defaultValue?: string }
  | { id: string; type: "checkbox"; label: string; options: string[]; defaultValue?: string[]; requiredOptions?: string[]; errorMessage?: string };

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
