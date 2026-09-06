import { Editor } from "@tinymce/tinymce-react";
import { tinyMCEConfig } from "../../utils/tinyMCEConfig";
import { useTheme } from "../../hooks/useTheme"; // Adjust path if necessary

export default function RichTextEditor({ value, onChange }) {
  const { theme } = useTheme();

  return (
    <Editor
    key={theme} 
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      value={value}
      init={{
        ...tinyMCEConfig,skin: theme === "dark" ? "oxide-dark" : "oxide",
        content_css: theme === "dark" ? "dark" : "default",
      }}
      onEditorChange={(content) => onChange(content)}
    />
  );
}