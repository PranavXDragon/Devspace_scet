import { Wand2, LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onDetectLanguage: () => void;
  isDetecting: boolean;
}

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'c++',
  'rust',
  'php',
  'ruby',
  'kotlin',
  'r',
  'bash'
];

export default function IDEEditor({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onDetectLanguage,
  isDetecting,
}: EditorProps) {
  return (
    <Card className="flex-1 flex flex-col h-full bg-card/50 border shadow-none rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-2 sm:p-4 border-b">
        <div className="text-lg font-semibold font-headline">Editor</div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[120px] sm:w-[150px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDetectLanguage} disabled={isDetecting}>
                  {isDetecting ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
                  <span className="sr-only">Detect Language</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Detect Language with AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative h-full">
        <Editor
          height="100%"
          language={language === 'c++' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'var(--font-mono), monospace',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </CardContent>
    </Card>
  );
}
