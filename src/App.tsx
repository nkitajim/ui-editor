import React, { useState } from "react";
import { Field, Mode, Theme, themes } from "./types";
import { AdminMode } from "./components/AdminMode";
import { UserMode } from "./components/UserMode";

const App: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState<Mode>("admin");
  const [themeIndex, setThemeIndex] = useState(0);
  const [autoUpdateJson, setAutoUpdateJson] = useState(true);
  const theme = themes[themeIndex];

  // fieldsが変更されたときにJSONを更新
  React.useEffect(() => {
    if (autoUpdateJson) {
    const json = JSON.stringify(fields, null, 2);
      setJsonInput(json);
    }
  }, [fields, autoUpdateJson]);

   return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen",
        backgroundColor: theme.background,
        minHeight: "100vh",
        padding: 20,
        color: theme.textColor,
        transition: "all 0.3s",
      }}
    >
      {/* モード切替＆テーマ選択 */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 24 }}>
        <div>
          <button
            style={{
              backgroundColor: mode === "admin" ? "#a3c0ff" : theme.primaryColor,
              color: mode === "admin" ? "#333" : (theme.textColor === "#ddd" ? "#fff" : "white"),
              border: "none",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: mode === "admin" ? "default" : "pointer",
              fontWeight: "600",
              boxShadow: mode === "admin" ? "none" : `0 2px 6px ${theme.primaryColor}66`,
              transition: "background-color 0.3s",
            }}
            onClick={() => setMode("admin")}
            disabled={mode === "admin"}
          >
            管理モード
          </button>
          <button
            style={{
              backgroundColor: mode === "user" ? "#a3c0ff" : theme.primaryColor,
              color: mode === "user" ? "#333" : (theme.textColor === "#ddd" ? "#fff" : "white"),
              border: "none",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: mode === "user" ? "default" : "pointer",
              fontWeight: "600",
              boxShadow: mode === "user" ? "none" : `0 2px 6px ${theme.primaryColor}66`,
              transition: "background-color 0.3s",
              marginLeft: 12,
            }}
            onClick={() => setMode("user")}
            disabled={mode === "user"}
          >
            ユーザーモード
          </button>
        </div>
        {mode === "admin" && (
          <div>
            <label style={{ marginRight: 8, fontWeight: "600" }}>テーマ:</label>
            <select
              value={themeIndex}
              onChange={(e) => setThemeIndex(Number(e.target.value))}
              style={{
                padding: 6,
                borderRadius: 6,
                border: `1.5px solid ${theme.primaryColor}`,
                backgroundColor: theme.lightPrimary,
                color: theme.primaryColor,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {themes.map((t, i) => (
                <option key={t.name} value={i}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {mode === "admin" ? (
        <AdminMode
          fields={fields}
          setFields={setFields}
          theme={theme}
          themeIndex={themeIndex}
          setThemeIndex={setThemeIndex}
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          autoUpdateJson={autoUpdateJson}
          setAutoUpdateJson={setAutoUpdateJson}
        />
      ) : (
        <UserMode fields={fields} theme={theme} />
      )}
    </div>
  );
};

export default App;
