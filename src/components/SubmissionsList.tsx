import React from 'react';
import { Theme } from '../types';
import { createStyles } from '../styles';

export type FormSubmission = {
  id: number;
  form_data: Record<string, any>;
  created_at?: string;
};

interface SubmissionsListProps {
  theme: Theme;
  submissions?: FormSubmission[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDelete?: (id: number) => void;
  onSelect?: (submission: FormSubmission) => void;
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  theme,
  submissions = [],
  loading = false,
  error = null,
  onRefresh,
  onDelete,
  onSelect,
}) => {
  const styles = createStyles(theme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('ja-JP');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: theme.textColor }}>
        データを読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: '#ff4d4f' }}>
        {error}
        <br />
        {onRefresh && (
          <button onClick={onRefresh} style={{ ...styles.buttonStyle, marginTop: 10 }}>
            再試行
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ color: theme.primaryColor, margin: 0 }}>保存されたデータ</h4>
        {onRefresh && (
          <button onClick={onRefresh} style={{ ...styles.buttonStyle, fontSize: 12, padding: '6px 12px' }}>
            更新
          </button>
        )}
      </div>

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20, color: theme.textColor, opacity: 0.7 }}>
          保存されたデータがありません
        </div>
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {submissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                border: `1px solid ${theme.primaryColor}33`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                backgroundColor: theme.name === 'ダーク' ? '#2c3e50' : '#f8f9fa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: theme.primaryColor, fontWeight: 600 }}>
                  ID: {submission.id}
                  {submission.created_at ? ` | ${formatDate(submission.created_at)}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(submission)}
                      style={{
                        backgroundColor: theme.primaryColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      編集
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(submission.id)}
                      style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 14, color: theme.textColor }}>
                {Object.entries(submission.form_data).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 4 }}>
                    <strong>{key}:</strong>{' '}
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
