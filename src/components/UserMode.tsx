import React, { useState } from 'react';
import { Field, Theme } from '../types';
import { createStyles } from '../styles';
import { apiService } from '../services/api';
import { SubmissionsList } from './SubmissionsList';
import { parseDescriptionWithLinks } from '../utils/textParser';

interface UserModeProps {
  fields: Field[];
  theme: Theme;
}

export const UserMode: React.FC<UserModeProps> = ({ fields, theme }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [checkboxValues, setCheckboxValues] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
        onSubmit={async (e) => {
          e.preventDefault();
          
          // エラーがある場合は送信しない
          if (hasErrors()) {
            setSubmitMessage({ type: 'error', text: '入力エラーがあります。修正してください。' });
            return;
          }

          setIsSubmitting(true);
          setSubmitMessage(null);

          try {
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

            // SQLiteにデータを保存
            const result = await apiService.submitForm(output);
            
            setSubmitMessage({ 
              type: 'success', 
              text: `データが正常に保存されました。ID: ${result.id}` 
            });

            // フォームをリセット
            setFormValues({});
            setCheckboxValues({});
            setValidationErrors({});

            // 保存されたデータリストを更新
            setRefreshTrigger(prev => prev + 1);

            console.log('保存されたデータ:', output);
            console.log('保存結果:', result);

            // 成功メッセージを3秒後に自動的に消す
            setTimeout(() => {
              setSubmitMessage(null);
            }, 3000);

          } catch (error) {
            console.error('送信エラー:', error);
            setSubmitMessage({ 
              type: 'error', 
              text: 'データの保存に失敗しました。サーバーが起動しているか確認してください。' 
            });

            // エラーメッセージを5秒後に自動的に消す
            setTimeout(() => {
              setSubmitMessage(null);
            }, 5000);
          } finally {
            setIsSubmitting(false);
          }
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
            {field.description && (
              <div
                style={{
                  fontSize: 14,
                  color: theme.textColor === "#ddd" ? "#bbb" : "#666",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
                dangerouslySetInnerHTML={{ __html: parseDescriptionWithLinks(field.description) }}
              />
            )}
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
        {submitMessage && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 6,
              backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: submitMessage.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${submitMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: 14,
            }}
          >
            {submitMessage.text}
          </div>
        )}
        
        <button
          type="submit"
          disabled={hasErrors() || isSubmitting}
          style={{ 
            ...(hasErrors() || isSubmitting ? styles.buttonDisabledStyle : styles.buttonStyle), 
            width: "100%", 
            fontSize: 16, 
            padding: "12px 0",
            backgroundColor: hasErrors() || isSubmitting ? "#a3c0ff" : styles.buttonStyle.backgroundColor,
          }}
        >
          {isSubmitting ? "送信中..." : hasErrors() ? "エラーがあります" : "送信"}
        </button>
      </form>
      
      <SubmissionsList theme={theme} refreshTrigger={refreshTrigger} />
    </div>
  );
};
