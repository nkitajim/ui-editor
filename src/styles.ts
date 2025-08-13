import { Theme } from './types';

export const createStyles = (theme: Theme) => {
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

  return {
    paletteItemStyle,
    buttonStyle,
    buttonDisabledStyle,
    inputStyle,
  };
};
