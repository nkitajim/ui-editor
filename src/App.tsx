import React, { useState } from "react";
import { Field, Mode, Theme, themes } from "./types";
import { AdminMode } from "./components/AdminMode";
import { UserMode } from "./components/UserMode";

const App: React.FC = () => {
  const getInitialMode = (): Mode => {
    try {
      const search = new URLSearchParams(window.location.search);
      const qp = (search.get("mode") || "").toLowerCase();
      if (qp === "admin" || qp === "user") return qp as Mode;
      const hash = (window.location.hash || "").toLowerCase();
      // 対応: #mode=user または #user
      if (hash.includes("mode=user") || hash === "#user") return "user";
      if (hash.includes("mode=admin") || hash === "#admin") return "admin";
    } catch {}
    return "admin";
  };

  const [fields, setFields] = useState<Field[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState<Mode>(() => getInitialMode());
  const [themeIndex, setThemeIndex] = useState(0);
  const [autoUpdateJson, setAutoUpdateJson] = useState(true);
  const theme = themes[themeIndex];

  // 起動時にデフォルトのフォーム設定を外部ファイルから読み込み
  // 優先順位: URL ?config= → REACT_APP_FORM_CONFIG → public/form-config.json
  React.useEffect(() => {
    let cancelled = false;
    const loadConfig = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlParam = params.get("config");
        const envPath = (process.env.REACT_APP_FORM_CONFIG || "").trim();
        const fallback = "form-config.json"; // public直下想定
        const configUrl = urlParam || envPath || fallback;

        const res = await fetch(configUrl, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setFields(data as Field[]);
        }
      } catch {
        // 取得失敗時は無視（手動で作成可能）
      }
    };
    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  // fieldsが変更されたときにJSONを更新
  React.useEffect(() => {
    if (autoUpdateJson) {
    const json = JSON.stringify(fields, null, 2);
      setJsonInput(json);
    }
  }, [fields, autoUpdateJson]);

  // モード変更時にURLクエリパラメータを更新（起動オプションでの指定も可能に）
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      window.history.replaceState({}, "", url.toString());
    } catch {}
  }, [mode]);

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
