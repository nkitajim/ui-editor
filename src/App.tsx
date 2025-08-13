import React, { useState } from "react";

type Field =
  | { id: string; type: "text"; label: string; defaultValue?: string; validationRegex?: string }
  | { id: string; type: "radio"; label: string; options: string[]; defaultValue?: string }
  | { id: string; type: "checkbox"; label: string; options: string[]; defaultValue?: string[] };

type Mode = "admin" | "user";

type Theme = {
  name: string;
  primaryColor: string;
  lightPrimary: string;
  background: string;
  textColor: string;
};

const themes: Theme[] = [
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

const App: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [dragging, setDragging] = useState<"text" | "radio" | "checkbox" | null>(null);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState<Mode>("admin");
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = themes[themeIndex];

  // フィールド操作は以前のまま
  const addField = (type: "text" | "radio" | "checkbox") => {
    const id = Date.now().toString();
    if (type === "text") {
      setFields([...fields, { id, type, label: "テキスト" }]);
    } else if (type === "radio") {
      setFields([...fields, { id, type, label: "ラジオ", options: ["選択肢1", "選択肢2"] }]);
    } else {
      setFields([...fields, { id, type, label: "チェック", options: ["項目1", "項目2"] }]);
    }
  };

  const updateLabel = (id: string, label: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, label } : f));
  };

  const updateOptions = (id: string, options: string[]) => {
    setFields(fields.map(f => f.id === id && "options" in f ? { ...f, options } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateValidationRegex = (id: string, regex: string | undefined) => {
    setFields(fields.map(f => f.id === id && f.type === "text" ? { ...f, validationRegex: regex } : f));
  };

  // フィールドの移動機能
  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    setFields(newFields);
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggingFieldId(fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleFieldDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    if (!draggingFieldId || draggingFieldId === targetFieldId) return;

    const fromIndex = fields.findIndex(f => f.id === draggingFieldId);
    const toIndex = fields.findIndex(f => f.id === targetFieldId);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      moveField(fromIndex, toIndex);
    }
    setDraggingFieldId(null);
  };

  const saveJSON = () => {
    const json = JSON.stringify(fields, null, 2);
    console.log(json);
    alert("JSONをコンソールに出力しました");
  };

  const loadJSON = () => {
    try {
      const parsed: Field[] = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        alert("JSONは配列形式である必要があります");
        return;
      }
      setFields(parsed);
      alert("JSONを読み込みました");
    } catch {
      alert("JSONの解析に失敗しました");
    }
  };

  // 以下、スタイルはテーマ変数を使う
  const paletteItemStyle: React.CSSProperties = {
    border: `1px solid ${theme.primaryColor}`,
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    cursor: "grab",
    backgroundColor: theme.lightPrimary,
    color: theme.primaryColor,
    fontWeight: "600",
    textAlign: "center",
    userSelect: "none",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: theme.primaryColor,
    color: theme.textColor === "#ddd" ? "#fff" : "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: `0 2px 6px ${theme.primaryColor}66`,
    transition: "background-color 0.3s",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#a3c0ff",
    cursor: "default",
    boxShadow: "none",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
    border: `1.5px solid #ccc`,
    outline: "none",
    fontSize: 14,
    fontFamily: "system-ui, sans-serif",
    transition: "border-color 0.3s",
    backgroundColor: theme.background,
    color: theme.textColor,
  };

  const [focusedId, setFocusedId] = useState<string | null>(null);

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
            style={mode === "admin" ? buttonDisabledStyle : buttonStyle}
            onClick={() => setMode("admin")}
            disabled={mode === "admin"}
          >
            管理モード
          </button>
          <button
            style={{ ...(mode === "user" ? buttonDisabledStyle : buttonStyle), marginLeft: 12 }}
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
        <div style={{ display: "flex", gap: 24 }}>
          {/* パレット */}
          <div style={{ width: 160 }}>
            <h3 style={{ color: theme.primaryColor, marginBottom: 12 }}>パレット</h3>
            <div
              draggable
              onDragStart={() => setDragging("text")}
              onDragEnd={() => setDragging(null)}
              style={paletteItemStyle}
            >
              テキスト
            </div>
            <div
              draggable
              onDragStart={() => setDragging("radio")}
              onDragEnd={() => setDragging(null)}
              style={paletteItemStyle}
            >
              ラジオボタン
            </div>
            <div
              draggable
              onDragStart={() => setDragging("checkbox")}
              onDragEnd={() => setDragging(null)}
              style={paletteItemStyle}
            >
              チェックボックス
            </div>
          </div>

          {/* フォーム編集エリア */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragging) {
                addField(dragging);
                setDragging(null);
              }
            }}
            style={{
              flex: 1,
              backgroundColor: theme.lightPrimary,
              borderRadius: 12,
              boxShadow: theme.name === "ダーク" ? "none" : "0 4px 15px rgba(0,0,0,0.08)",
              padding: 20,
              minHeight: 400,
              overflowY: "auto",
              color: theme.textColor,
            }}
          >
            <h3 style={{ color: theme.primaryColor, marginBottom: 20 }}>フォーム編集</h3>
            {fields.map((field) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleFieldDragStart(e, field.id)}
                onDragOver={handleFieldDragOver}
                onDrop={(e) => handleFieldDrop(e, field.id)}
                style={{
                  border: `1px solid ${theme.primaryColor}44`,
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: theme.name === "ダーク" ? "#22303f" : "white",
                  cursor: "grab",
                  transition: "all 0.2s ease",
                  opacity: draggingFieldId === field.id ? 0.5 : 1,
                  transform: draggingFieldId === field.id ? "scale(0.98)" : "scale(1)",
                  boxShadow: draggingFieldId === field.id 
                    ? `0 4px 12px ${theme.primaryColor}44` 
                    : "0 2px 8px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => {
                  if (draggingFieldId !== field.id) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primaryColor}44`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (draggingFieldId !== field.id) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }
                }}
              >
                {/* ドラッグハンドル */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: `1px solid ${theme.primaryColor}22`,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: theme.primaryColor,
                      borderRadius: 4,
                      marginRight: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "grab",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: "white",
                        borderRadius: 1,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: theme.primaryColor,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {field.type === "text" ? "テキスト" : field.type === "radio" ? "ラジオ" : "チェック"}
                  </span>
                </div>

                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateLabel(field.id, e.target.value)}
                  placeholder="ラベル"
                  style={{
                    ...inputStyle,
                    ...(focusedId === field.id + "-label" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                    marginBottom: 12,
                    backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                    color: theme.textColor,
                  }}
                  onFocus={() => setFocusedId(field.id + "-label")}
                  onBlur={() => setFocusedId(null)}
                />

                {/* デフォルト値と正規表現入力(テキストのみ) */}
                {field.type === "text" && (
                  <>
                    <input
                      type="text"
                      placeholder="デフォルト値"
                      value={field.defaultValue || ""}
                      style={{
                        ...inputStyle,
                        ...(focusedId === field.id + "-default" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-default")}
                      onBlur={() => setFocusedId(null)}
                    />
                    <input
                      type="text"
                      placeholder="正規表現 (例: ^[0-9]+$)"
                      value={field.validationRegex || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        updateValidationRegex(field.id, val || undefined);
                      }}
                      style={{
                        ...inputStyle,
                        ...(focusedId === field.id + "-regex" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-regex")}
                      onBlur={() => setFocusedId(null)}
                    />
                    <input
                      type="text"
                      placeholder="テキスト入力欄（プレビュー）"
                      defaultValue={field.defaultValue}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: theme.name === "ダーク" ? "#3a4a63" : "#dbe9ff",
                        cursor: "not-allowed",
                        color: theme.textColor === "#ddd" ? "#ccc" : "#555",
                        marginTop: 8,
                      }}
                    />
                  </>
                )}

                {/* ラジオボタン */}
                {field.type === "radio" && (
                  <>
                    <input
                      type="text"
                      placeholder="デフォルト値"
                      value={field.defaultValue || ""}
                      style={{
                        ...inputStyle,
                        ...(focusedId === field.id + "-default" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        marginBottom: 12,
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-default")}
                      onBlur={() => setFocusedId(null)}
                    />
                    {field.options.map((opt, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                        <input type="radio" disabled checked={field.defaultValue === opt} />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...field.options];
                            newOpts[idx] = e.target.value;
                            updateOptions(field.id, newOpts);
                          }}
                          style={{
                            ...inputStyle,
                            marginLeft: 8,
                            flex: 1,
                            backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                            color: theme.textColor,
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateOptions(field.id, [...field.options, "新しい選択肢"])}
                      style={{ ...buttonStyle, marginTop: 8 }}
                    >
                      選択肢追加
                    </button>
                  </>
                )}

                {/* チェックボックス */}
                {field.type === "checkbox" && (
                  <>
                    <input
                      type="text"
                      placeholder="デフォルト値（カンマ区切り）"
                      value={Array.isArray(field.defaultValue) ? field.defaultValue.join(",") : ""}
                      style={{
                        ...inputStyle,
                        ...(focusedId === field.id + "-default" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        marginBottom: 12,
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-default")}
                      onBlur={() => setFocusedId(null)}
                    />
                    {field.options.map((opt, idx) => {
                      const checked =
                        Array.isArray(field.defaultValue) && field.defaultValue.includes(opt);
                      return (
                        <div
                          key={idx}
                          style={{ display: "flex", alignItems: "center", marginBottom: 6 }}
                        >
                          <input type="checkbox" disabled checked={checked} />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...field.options];
                              newOpts[idx] = e.target.value;
                              updateOptions(field.id, newOpts);
                            }}
                            style={{
                              ...inputStyle,
                              marginLeft: 8,
                              flex: 1,
                              backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                              color: theme.textColor,
                            }}
                          />
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => updateOptions(field.id, [...field.options, "新しい選択肢"])}
                      style={{ ...buttonStyle, marginTop: 8 }}
                    >
                      選択肢追加
                    </button>
                  </>
                )}

                <button
                  onClick={() => removeField(field.id)}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#ff4d4f",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: "600",
                    boxShadow: "0 2px 6px #ff4d4f88",
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          {/* JSON入出力 */}
          <div style={{ width: 320 }}>
            <h3 style={{ color: theme.primaryColor, marginBottom: 12 }}>JSON入出力</h3>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              style={{
                width: "100%",
                height: 340,
                borderRadius: 12,
                border: `1.5px solid ${theme.primaryColor}66`,
                padding: 12,
                fontFamily: "monospace",
                fontSize: 14,
                resize: "vertical",
                backgroundColor: theme.background,
                color: theme.textColor,
              }}
              placeholder="ここにJSONを貼り付けて「読み込み」ボタンを押してください"
            />
            <div style={{ marginTop: 16 }}>
              <button onClick={saveJSON} style={{ ...buttonStyle, width: 140 }}>
                JSON保存（コンソール出力）
              </button><button
                onClick={loadJSON}
                style={{ ...buttonStyle, width: 140, marginLeft: 12, backgroundColor: theme.primaryColor === "#007BFF" ? "#0056b3" : theme.primaryColor }}
              >
                JSON読み込み
              </button>
            </div>
          </div>
        </div>
      ) : (
        // ユーザーモード
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            backgroundColor: theme.name === "ダーク" ? "#22303f" : "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: theme.name === "ダーク" ? "none" : "0 4px 25px rgba(0,0,0,0.1)",
            color: theme.textColor,
          }}
        >
          <h3 style={{ color: theme.primaryColor, marginBottom: 20, textAlign: "center" }}>ユーザーモード（フォーム）</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const output: Record<string, any> = {};

              for (const field of fields) {
                if (field.type === "text") {
                  const val = formData.get(field.id)?.toString() || "";
                  if (field.validationRegex) {
                    try {
                      const re = new RegExp(field.validationRegex);
                      if (!re.test(val)) {
                        alert(`"${field.label}" の入力値が正規表現 "${field.validationRegex}" にマッチしません。`);
                        return;
                      }
                    } catch {
                      alert(`"${field.label}" の正規表現が不正です。`);
                      return;
                    }
                  }
                  output[field.label] = val;
                } else if (field.type === "radio") {
                  output[field.label] = formData.get(field.id);
                } else if (field.type === "checkbox") {
                  const values: string[] = [];
                  field.options.forEach((opt, idx) => {
                    const val = formData.get(`${field.id}-${idx}`);
                    if (val) values.push(val.toString());
                  });
                  output[field.label] = values;
                }
              }

              const json = JSON.stringify(output, null, 2);
              console.log(json);
              alert("入力値のJSON:\n" + json);
            }}
          >
            {fields.map((field) => (
              <div key={field.id} style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    color: theme.primaryColor,
                    marginBottom: 8,
                    fontSize: 16,
                  }}
                >
                  {field.label}
                </label>
                <div>
                  {field.type === "text" && (
                    <input
                      type="text"
                      name={field.id}
                      defaultValue={field.defaultValue as string | undefined}
                      style={{
                        ...inputStyle,
                        borderColor: theme.primaryColor,
                        boxShadow: `0 0 6px ${theme.primaryColor}55`,
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                    />
                  )}
                  {field.type === "radio" &&
                    field.options.map((opt, idx) => (
                      <label
                        key={idx}
                        style={{
                          marginRight: 16,
                          cursor: "pointer",
                          userSelect: "none",
                          fontSize: 15,
                          color: theme.textColor,
                        }}
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          defaultChecked={field.defaultValue === opt}
                          style={{ marginRight: 6, cursor: "pointer" }}
                        />
                        {opt}
                      </label>
                    ))}
                  {field.type === "checkbox" &&
                    field.options.map((opt, idx) => {
                      const checked =
                        Array.isArray(field.defaultValue) && field.defaultValue.includes(opt);
                      return (
                        <label
                          key={idx}
                          style={{
                            marginRight: 16,
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: 15,
                            color: theme.textColor,
                          }}
                        >
                          <input
                            type="checkbox"
                            name={`${field.id}-${idx}`}
                            value={opt}
                            defaultChecked={checked}
                            style={{ marginRight: 6, cursor: "pointer" }}
                          />
                          {opt}
                        </label>
                      );
                    })}
                </div>
              </div>
            ))}
            <button
              type="submit"
              style={{ ...buttonStyle, width: "100%", fontSize: 16, padding: "12px 0" }}
            >
              送信
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
