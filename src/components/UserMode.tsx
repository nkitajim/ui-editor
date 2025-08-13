import React, { useState } from 'react';
import { Field, Theme } from '../types';
import { createStyles } from '../styles';

interface UserModeProps {
  fields: Field[];
  theme: Theme;
}

export const UserMode: React.FC<UserModeProps> = ({ fields, theme }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [checkboxValues, setCheckboxValues] = useState<Record<string, string[]>>({});
  const styles = createStyles(theme);

  // バリデーション関数
  const validateField = (fieldId: string, value: string): string | null => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || field.type !== "text" || !field.validationRegex) {
      return null;
    }

    try {
      const regex = new RegExp(field.validationRegex);
      if (!regex.test(value)) {
        return `入力値が正規表現 "${field.validationRegex}" にマッチしません`;
      }
    } catch (error) {
      return "正規表現が不正です";
    }

    return null;
  };

  // チェックボックスの必須項目バリデーション
  const validateCheckboxRequired = (fieldId: string, checkedValues: string[]): string | null => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || field.type !== "checkbox" || !field.requiredOptions) {
      return null;
    }

    const missingOptions = field.requiredOptions.filter(option => !checkedValues.includes(option));
    if (missingOptions.length > 0) {
      return field.errorMessage || `以下の項目は必須です: ${missingOptions.join(", ")}`;
    }

    return null;
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    
    // バリデーション実行
    const error = validateField(fieldId, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldId]: error || ""
    }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = checkboxValues[fieldId] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, option];
    } else {
      newValues = currentValues.filter(val => val !== option);
    }
    
    setCheckboxValues(prev => ({ ...prev, [fieldId]: newValues }));
    
    // チェックボックスのバリデーション実行
    const error = validateCheckboxRequired(fieldId, newValues);
    setValidationErrors(prev => ({
      ...prev,
      [fieldId]: error || ""
    }));
  };

  const hasErrors = () => {
    return Object.values(validationErrors).some(error => error !== "");
  };

  return (
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
          
          // エラーがある場合は送信しない
          if (hasErrors()) {
            alert("入力エラーがあります。修正してください。");
            return;
          }

          const output: Record<string, any> = {};

          for (const field of fields) {
            if (field.type === "text") {
              const val = formValues[field.id] || field.defaultValue || "";
              output[field.label] = val;
            } else if (field.type === "radio") {
              const formData = new FormData(e.currentTarget);
              const selectedValue = formData.get(field.id);
              output[field.label] = selectedValue || field.defaultValue || "";
            } else if (field.type === "checkbox") {
              const values = checkboxValues[field.id] || [];
              // 選択された値がない場合はデフォルト値を使用
              output[field.label] = values.length > 0 ? values : (field.defaultValue as string[] || []);
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
                <>
                  <input
                    type="text"
                    name={field.id}
                    value={formValues[field.id] || field.defaultValue || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    style={{
                      ...styles.inputStyle,
                      borderColor: validationErrors[field.id] ? "#ff4d4f" : theme.primaryColor,
                      boxShadow: validationErrors[field.id] 
                        ? `0 0 6px #ff4d4f55` 
                        : `0 0 6px ${theme.primaryColor}55`,
                      backgroundColor: theme.name === "ダーク" ? "#2c3e50" : undefined,
                      color: theme.textColor,
                    }}
                  />
                  {validationErrors[field.id] && (
                    <div
                      style={{
                        color: "#ff4d4f",
                        fontSize: 12,
                        marginTop: 4,
                        fontWeight: "500",
                      }}
                    >
                      {validationErrors[field.id]}
                    </div>
                  )}
                </>
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
              {field.type === "checkbox" && (
                <>
                  {field.options.map((opt, idx) => {
                    const currentValues = checkboxValues[field.id] || [];
                    const isDefaultChecked = Array.isArray(field.defaultValue) && field.defaultValue.includes(opt);
                    const isChecked = currentValues.includes(opt) || (currentValues.length === 0 && isDefaultChecked);
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
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                          style={{ marginRight: 6, cursor: "pointer" }}
                        />
                        {opt}
                      </label>
                    );
                  })}
                  {validationErrors[field.id] && (
                    <div
                      style={{
                        color: "#ff4d4f",
                        fontSize: 12,
                        marginTop: 8,
                        fontWeight: "500",
                      }}
                    >
                      {validationErrors[field.id]}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <button
          type="submit"
          disabled={hasErrors()}
          style={{ 
            ...(hasErrors() ? styles.buttonDisabledStyle : styles.buttonStyle), 
            width: "100%", 
            fontSize: 16, 
            padding: "12px 0",
            backgroundColor: hasErrors() ? "#a3c0ff" : styles.buttonStyle.backgroundColor,
          }}
        >
          {hasErrors() ? "エラーがあります" : "送信"}
        </button>
      </form>
    </div>
  );
};
