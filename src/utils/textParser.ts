// 説明文のリンクを解析してHTMLに変換
// 対応記法:
// - リンク: [テキスト](URL)
// - 太字: **テキスト**
// - 小さい文字: ^^テキスト^^
// - 改行: \n → <br />

// ユーザー入力のHTMLを安全にエスケープ
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

// 管理モードのプレビューなどで、リンクを人間可読に整形する（HTMLにしない）
export const getDescriptionPreview = (text: string): string => {
  if (!text) return "";
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(linkRegex, (_m, linkText, url) => `${linkText} (${url})`);
};

// 実表示用（dangerouslySetInnerHTMLで使用）に、限定的にHTMLへ変換
export const parseDescriptionWithLinks = (text: string): string => {
  if (!text) return "";

  // まずすべてエスケープ
  let result = escapeHtml(text);

  // リンク [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  result = result.replace(linkRegex, (_m, linkText: string, url: string) => {
    const safeText = escapeHtml(linkText);
    const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    return `<a href="${validUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${safeText}</a>`;
  });

  // 太字 **text**
  const boldRegex = /\*\*(.+?)\*\*/g;
  result = result.replace(boldRegex, (_m, content: string) => `<strong>${content}</strong>`);

  // 小さい文字 ^^text^^
  const smallRegex = /\^\^(.+?)\^\^/g;
  result = result.replace(smallRegex, (_m, content: string) => `<small>${content}</small>`);

  // 改行
  result = result.replace(/\n/g, "<br />");

  return result;
};
