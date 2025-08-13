import React, { useState } from 'react';
import { Field, Group, Theme } from '../types';
import { createStyles } from '../styles';
import { getDescriptionPreview, parseDescriptionWithLinks } from '../utils/textParser';

interface AdminModeProps {
  fields: Field[];
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  theme: Theme;
  themeIndex: number;
  setThemeIndex: (index: number) => void;
  jsonInput: string;
  setJsonInput: (json: string) => void;
  autoUpdateJson: boolean;
  setAutoUpdateJson: (auto: boolean) => void;
}

export const AdminMode: React.FC<AdminModeProps> = ({
  fields,
  setFields,
  groups,
  setGroups,
  theme,
  themeIndex,
  setThemeIndex,
  jsonInput,
  setJsonInput,
  autoUpdateJson,
  setAutoUpdateJson,
}) => {
  const [dragging, setDragging] = useState<"text" | "radio" | "checkbox" | "map" | null>(null);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [mapDefaultRows, setMapDefaultRows] = useState<Record<string, { key: string; value: string }[]>>({});
  const styles = createStyles(theme);

  // グループ操作
  const addGroup = () => {
    const id = `g_${Date.now()}`;
    setGroups([...
      groups,
      { id, name: `グループ${groups.length + 1}`, padding: true }
    ]);
  };
  const updateGroupName = (id: string, name: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, name } : g));
  };
  const updateGroupPadding = (id: string, padding: boolean) => {
    setGroups(groups.map(g => g.id === id ? { ...g, padding } : g));
  };
  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    // グループ削除時にフィールドのgroupIdをクリア
    setFields(fields.map(f => f.groupId === id ? { ...f, groupId: undefined } as Field : f));
  };

  // フィールド操作
  const addField = (type: "text" | "radio" | "checkbox" | "map") => {
    const id = Date.now().toString();
    if (type === "text") {
      setFields([...fields, { id, type, label: "テキスト" }]);
    } else if (type === "radio") {
      setFields([...fields, { id, type, label: "ラジオ", options: ["選択肢1", "選択肢2"] }]);
    } else if (type === "checkbox") {
      setFields([...fields, { id, type, label: "チェック", options: ["項目1", "項目2"] }]);
    } else {
      setFields([...fields, { id, type, label: "マップ", defaultValue: {} } as any]);
    }
  };

  const updateLabel = (id: string, label: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, label } : f));
  };

  const updateDescription = (id: string, description: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, description: description || undefined } : f));
  };

  const updateOptions = (id: string, options: string[]) => {
    setFields(fields.map(f => f.id === id && "options" in f ? { ...f, options } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    setMapDefaultRows(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateTextValidationRegex = (id: string, regex: string | undefined) => {
    setFields(fields.map(f => (f.id === id && f.type === "text") ? { ...f, validationRegex: regex } : f));
  };

  const updateMapValidationRegex = (id: string, kind: 'key' | 'value', regex: string | undefined) => {
    setFields(fields.map(f => {
      if (f.id === id && (f as any).type === 'map') {
        if (kind === 'key') {
          return { ...(f as any), keyValidationRegex: regex } as Field;
        }
        return { ...(f as any), valueValidationRegex: regex } as Field;
      }
      return f;
    }));
  };

  // map デフォルト値 行編集
  React.useEffect(() => {
    setMapDefaultRows(prev => {
      const next: Record<string, { key: string; value: string }[]> = { ...prev };
      const mapFieldIds = new Set<string>();
      for (const f of fields) {
        if ((f as any).type === 'map') {
          mapFieldIds.add(f.id);
          if (!next[f.id]) {
            const def = (f as any).defaultValue as Record<string, string> | undefined;
            next[f.id] = def ? Object.entries(def).map(([k, v]) => ({ key: String(k), value: String(v) })) : [];
          }
        }
      }
      Object.keys(next).forEach(id => {
        if (!mapFieldIds.has(id)) delete next[id];
      });
      return next;
    });
  }, [fields]);

  const setMapRowsAndCommit = (fieldId: string, updater: (prev: { key: string; value: string }[]) => { key: string; value: string }[]) => {
    setMapDefaultRows(prevAll => {
      const nextRows = updater(prevAll[fieldId] || []);
      // commit to fields.defaultValue
      const obj: Record<string, string> = {};
      for (const { key, value } of nextRows) {
        if (key !== '') obj[key] = value;
      }
      setFields(current => current.map(f => (f.id === fieldId && (f as any).type === 'map') ? ({ ...(f as any), defaultValue: obj } as Field) : f));
      return { ...prevAll, [fieldId]: nextRows };
    });
  };

  const addMapRow = (fieldId: string) => {
    setMapRowsAndCommit(fieldId, prev => [...prev, { key: '', value: '' }]);
  };

  const removeMapRow = (fieldId: string, index: number) => {
    setMapRowsAndCommit(fieldId, prev => prev.filter((_, i) => i !== index));
  };

  const updateMapRowKey = (fieldId: string, index: number, key: string) => {
    setMapRowsAndCommit(fieldId, prev => prev.map((e, i) => i === index ? { ...e, key } : e));
  };

  const updateMapRowValue = (fieldId: string, index: number, value: string) => {
    setMapRowsAndCommit(fieldId, prev => prev.map((e, i) => i === index ? { ...e, value } : e));
  };

  const updateRequiredOptions = (id: string, requiredOptions: string[]) => {
    setFields(fields.map(f => f.id === id && f.type === "checkbox" ? { ...f, requiredOptions: requiredOptions.length > 0 ? requiredOptions : undefined } : f));
  };

  const updateErrorMessage = (id: string, errorMessage: string) => {
    setFields(fields.map(f => f.id === id && f.type === "checkbox" ? { ...f, errorMessage: errorMessage || undefined } : f));
  };

  const updateDefaultValue = (id: string, defaultValue: string) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        if (f.type === "text") {
          return { ...f, defaultValue: defaultValue || undefined };
        } else if (f.type === "radio") {
          return { ...f, defaultValue: defaultValue || undefined };
        } else if (f.type === "checkbox") {
          const values = defaultValue ? defaultValue.split(',').map(v => v.trim()).filter(v => v) : [];
          return { ...f, defaultValue: values.length > 0 ? values : undefined };
        } else if ((f as any).type === "map") {
          try {
            const obj = defaultValue ? JSON.parse(defaultValue) : undefined;
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
              return { ...(f as any), defaultValue: obj } as Field;
            }
            return { ...(f as any), defaultValue: undefined } as Field;
          } catch {
            return { ...(f as any), defaultValue: undefined } as Field;
          }
        }
      }
      return f;
    }));
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

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* パレット */}
      <div style={{ width: 160 }}>
        <h3 style={{ color: theme.primaryColor, marginBottom: 12 }}>パレット</h3>
        <div
          draggable
          onDragStart={() => setDragging("text")}
          onDragEnd={() => setDragging(null)}
          style={styles.paletteItemStyle}
        >
          テキスト
        </div>
        <div
          draggable
          onDragStart={() => setDragging("radio")}
          onDragEnd={() => setDragging(null)}
          style={styles.paletteItemStyle}
        >
          ラジオボタン
        </div>
        <div
          draggable
          onDragStart={() => setDragging("checkbox")}
          onDragEnd={() => setDragging(null)}
          style={styles.paletteItemStyle}
        >
          チェックボックス
        </div>
        <div
          draggable
          onDragStart={() => setDragging("map")}
          onDragEnd={() => setDragging(null)}
          style={styles.paletteItemStyle}
        >
          マップ（キー/値）
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
                ...styles.inputStyle,
                ...(focusedId === field.id + "-label" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                marginBottom: 12,
                backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                color: theme.textColor,
              }}
              onFocus={() => setFocusedId(field.id + "-label")}
              onBlur={() => setFocusedId(null)}
            />
            {/* グループ割り当て */}
            {groups.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: theme.primaryColor, marginRight: 8 }}>グループ:</label>
                <select
                  value={(field as any).groupId || ''}
                  onChange={(e) => {
                    const gid = e.target.value || undefined;
                    setFields(fields.map(f => f.id === field.id ? ({ ...f, groupId: gid } as Field) : f));
                  }}
                  style={{ padding: 6, borderRadius: 6, border: `1.5px solid ${theme.primaryColor}55` }}
                >
                  <option value="">未分類</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}
            <textarea
              value={field.description || ""}
              onChange={(e) => updateDescription(field.id, e.target.value)}
              placeholder="説明文（任意）&#10;リンク: [テキスト](URL)（例: [詳細はこちら](https://example.com)）&#10;太字: **重要**（例）&#10;小さな文字: ^^補足^^（例）"
              style={{
                ...styles.inputStyle,
                ...(focusedId === field.id + "-description" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                marginBottom: 8,
                minHeight: 80,
                resize: "vertical",
                backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                color: theme.textColor,
              }}
              onFocus={() => setFocusedId(field.id + "-description")}
              onBlur={() => setFocusedId(null)}
            />
            {field.description && (
              <div
                style={{
                  fontSize: 12,
                  color: theme.textColor === "#ddd" ? "#bbb" : "#666",
                  marginBottom: 12,
                  padding: 8,
                  backgroundColor: theme.name === "ダーク" ? "#34495e" : "#f8f9fa",
                  borderRadius: 4,
                  border: `1px solid ${theme.primaryColor}33`,
                }}
              >
                <strong>プレビュー:</strong>{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: parseDescriptionWithLinks(field.description) }}
                />
              </div>
            )}

            {/* デフォルト値と正規表現入力(テキストのみ) */}
            {field.type === "text" && (
              <>
                <input
                  type="text"
                  placeholder="デフォルト値"
                  value={field.defaultValue || ""}
                  onChange={(e) => updateDefaultValue(field.id, e.target.value)}
                  style={{
                    ...styles.inputStyle,
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
                    value={(field as any).validationRegex || ""}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      updateTextValidationRegex(field.id, val || undefined);
                    }}
                    style={{
                      ...styles.inputStyle,
                      ...(focusedId === field.id + "-regex" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                      backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                      color: theme.textColor,
                    }}
                    onFocus={() => setFocusedId(field.id + "-regex")}
                    onBlur={() => setFocusedId(null)}
                  />
                <input
                  type="text"
                  placeholder={"テキスト入力欄（プレビュー）"}
                  defaultValue={field.defaultValue as any}
                  disabled
                  style={{
                    ...styles.inputStyle,
                    backgroundColor: theme.name === "ダーク" ? "#3a4a63" : "#dbe9ff",
                    cursor: "not-allowed",
                    color: theme.textColor === "#ddd" ? "#ccc" : "#555",
                    marginTop: 8,
                  }}
                />
              </>
            )}
            {field.type === 'map' && (
              <>
                {(mapDefaultRows[field.id] ?? []).map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="キー"
                      value={row.key}
                      onChange={(e) => updateMapRowKey(field.id, idx, e.target.value)}
                      style={{
                        ...styles.inputStyle,
                        flex: 1,
                        backgroundColor: theme.name === 'ダーク' ? '#2c3e50' : undefined,
                        color: theme.textColor,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="値"
                      value={row.value}
                      onChange={(e) => updateMapRowValue(field.id, idx, e.target.value)}
                      style={{
                        ...styles.inputStyle,
                        flex: 1,
                        backgroundColor: theme.name === 'ダーク' ? '#2c3e50' : undefined,
                        color: theme.textColor,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeMapRow(field.id, idx)}
                      style={{
                        backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: 6,
                        padding: '8px 10px', cursor: 'pointer', fontWeight: 600
                      }}
                      title="行を削除"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
                  <button type="button" onClick={() => addMapRow(field.id)} style={{ ...styles.buttonStyle }}>
                    行を追加
                  </button>
                </div>
                  <>
                    <input
                      type="text"
                      placeholder="キーの正規表現 (例: ^[A-Za-z_][A-Za-z0-9_]*$)"
                      value={(field as any).keyValidationRegex || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        updateMapValidationRegex(field.id, 'key', val || undefined);
                      }}
                      style={{
                        ...styles.inputStyle,
                        ...(focusedId === field.id + "-keyregex" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-keyregex")}
                      onBlur={() => setFocusedId(null)}
                    />
                    <input
                      type="text"
                      placeholder="値の正規表現 (例: ^[0-9]+$)"
                      value={(field as any).valueValidationRegex || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        updateMapValidationRegex(field.id, 'value', val || undefined);
                      }}
                      style={{
                        ...styles.inputStyle,
                        ...(focusedId === field.id + "-valueregex" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-valueregex")}
                      onBlur={() => setFocusedId(null)}
                    />
                  </>
                <input
                  type="text"
                  placeholder={"マップ（プレビュー: JSON）"}
                  defaultValue={JSON.stringify((field as any).defaultValue || {})}
                  disabled
                  style={{
                    ...styles.inputStyle,
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
                    {/* 重複する説明文UIは上部に集約済み */}
                    <input
                      type="text"
                      placeholder="デフォルト値（選択肢のいずれかを入力）"
                      value={field.defaultValue || ""}
                      onChange={(e) => updateDefaultValue(field.id, e.target.value)}
                      style={{
                        ...styles.inputStyle,
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
                        ...styles.inputStyle,
                        marginLeft: 8,
                        flex: 1,
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = field.options.filter((_, optionIdx) => optionIdx !== idx);
                        updateOptions(field.id, newOpts);
                        if (field.defaultValue === opt) {
                          updateDefaultValue(field.id, "");
                        }
                      }}
                      style={{
                        marginLeft: 8,
                        backgroundColor: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="選択肢を削除"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateOptions(field.id, [...field.options, "新しい選択肢"])}
                  style={{ ...styles.buttonStyle, marginTop: 8 }}
                >
                  選択肢追加
                </button>
              </>
            )}

                            {/* チェックボックス */}
                {field.type === "checkbox" && (
                  <>
                    {/* 重複する説明文UIは上部に集約済み */}
                    <input
                      type="text"
                      placeholder="デフォルト値（カンマ区切りで選択肢を入力）"
                      value={Array.isArray(field.defaultValue) ? field.defaultValue.join(",") : ""}
                      onChange={(e) => updateDefaultValue(field.id, e.target.value)}
                      style={{
                        ...styles.inputStyle,
                        ...(focusedId === field.id + "-default" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                        marginBottom: 12,
                        backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                        color: theme.textColor,
                      }}
                      onFocus={() => setFocusedId(field.id + "-default")}
                      onBlur={() => setFocusedId(null)}
                    />
                <input
                  type="text"
                  placeholder="必須項目（カンマ区切りで選択肢を入力）"
                  value={Array.isArray(field.requiredOptions) ? field.requiredOptions.join(",") : ""}
                  onChange={(e) => {
                    const values = e.target.value ? e.target.value.split(',').map(v => v.trim()).filter(v => v) : [];
                    updateRequiredOptions(field.id, values);
                  }}
                  style={{
                    ...styles.inputStyle,
                    ...(focusedId === field.id + "-required" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                    marginBottom: 12,
                    backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                    color: theme.textColor,
                  }}
                  onFocus={() => setFocusedId(field.id + "-required")}
                  onBlur={() => setFocusedId(null)}
                />
                <input
                  type="text"
                  placeholder="エラーメッセージ（例：この項目は必須です）"
                  value={field.errorMessage || ""}
                  onChange={(e) => updateErrorMessage(field.id, e.target.value)}
                  style={{
                    ...styles.inputStyle,
                    ...(focusedId === field.id + "-error" ? { borderColor: theme.primaryColor, boxShadow: `0 0 6px ${theme.primaryColor}aa` } : {}),
                    marginBottom: 12,
                    backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                    color: theme.textColor,
                  }}
                  onFocus={() => setFocusedId(field.id + "-error")}
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
                          ...styles.inputStyle,
                          marginLeft: 8,
                          flex: 1,
                          backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                          color: theme.textColor,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = field.options.filter((_, optionIdx) => optionIdx !== idx);
                          updateOptions(field.id, newOpts);
                          if (Array.isArray(field.defaultValue) && field.defaultValue.includes(opt)) {
                            const newDefaults = field.defaultValue.filter(defaultOpt => defaultOpt !== opt);
                            const newDefaultsString = newDefaults.join(",");
                            updateDefaultValue(field.id, newDefaultsString);
                          }
                        }}
                        style={{
                          marginLeft: 8,
                          backgroundColor: "#ff4d4f",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          width: 24,
                          height: 24,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="選択肢を削除"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => updateOptions(field.id, [...field.options, "新しい選択肢"])}
                  style={{ ...styles.buttonStyle, marginTop: 8 }}
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

      {/* JSON入出力 ＋ グループ管理 */}
      <div style={{ width: 320 }}>
        <h3 style={{ color: theme.primaryColor, marginBottom: 12 }}>JSON入出力</h3>
        {/* グループ管理 */}
        <div style={{ marginBottom: 16, padding: 12, border: `1px solid ${theme.primaryColor}33`, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ color: theme.primaryColor }}>グループ管理</strong>
            <button type="button" onClick={addGroup} style={{ ...styles.buttonStyle, padding: '4px 8px', fontSize: 12 }}>グループ追加</button>
          </div>
          {groups.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.7, color: theme.textColor }}>グループがありません</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {groups.map(g => (
                <div key={g.id} style={{ border: `1px solid ${theme.primaryColor}22`, borderRadius: 6, padding: 8 }}>
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => updateGroupName(g.id, e.target.value)}
                    placeholder="グループ名"
                    style={{ ...styles.inputStyle, marginBottom: 6 }}
                  />
                  <label style={{ fontSize: 12 }}>
                    <input type="checkbox" checked={!!g.padding} onChange={(e) => updateGroupPadding(g.id, e.target.checked)} style={{ marginRight: 6 }} />
                    デフォルトpaddingを適用
                  </label>
                  <div>
                    <button type="button" onClick={() => removeGroup(g.id)} style={{ marginTop: 6, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>削除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoUpdateJson}
              onChange={(e) => setAutoUpdateJson(e.target.checked)}
              style={{ marginRight: 8, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: theme.textColor }}>自動更新</span>
          </label>
        </div>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          style={{
            width: "100%",
            height: 300,
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
          <button onClick={saveJSON} style={{ ...styles.buttonStyle, width: 140 }}>
            JSON保存（コンソール出力）
          </button>
          <button
            onClick={loadJSON}
            style={{ ...styles.buttonStyle, width: 140, marginLeft: 12, backgroundColor: theme.primaryColor === "#007BFF" ? "#0056b3" : theme.primaryColor }}
          >
            JSON読み込み
          </button>
        </div>
      </div>
    </div>
  );
};
