const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '');

export type FormSubmission = {
  id: number;
  form_data: Record<string, any>;
  created_at?: string;
};

export type ApiResponse = {
  success: boolean;
  message: string;
  id?: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { /* noop */ }
    const msg = body?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  // フォームデータを新規保存
  async submitForm(formData: Record<string, any>): Promise<ApiResponse> {
    return request<ApiResponse>(`/submit-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  },

  // すべての保存データを取得
  async getSubmissions(): Promise<FormSubmission[]> {
    return request<FormSubmission[]>(`/submissions`);
  },

  // 単一の保存データを取得
  async getSubmission(id: number): Promise<FormSubmission> {
    return request<FormSubmission>(`/submissions/${id}`);
  },

  // 既存データを更新
  async updateSubmission(id: number, formData: Record<string, any>): Promise<ApiResponse> {
    return request<ApiResponse>(`/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  },

  // データを削除
  async deleteSubmission(id: number): Promise<ApiResponse> {
    return request<ApiResponse>(`/submissions/${id}`, { method: 'DELETE' });
  },
};
