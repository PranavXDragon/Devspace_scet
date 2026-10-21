import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Terminal, FileInput, BookOpen } from "lucide-react";
import Editor from "./Editor";
import InputPanel from "./InputPanel";
import OutputConsole from "./Console";
import ProblemPanel, { ProblemData } from "./ProblemPanel";

interface MobileTabsProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onDetectLanguage: () => void;
  isDetecting: boolean;
  input: string;
  onInputChange: (input: string) => void;
  onClearInput: () => void;
  output: string[];
  onClearOutput?: () => void;
  activeTab?: string;
  onActiveTabChange?: (tab: string) => void;
  problem?: ProblemData | null;
}

export default function MobileTabs({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onDetectLanguage,
  isDetecting,
  input,
  onInputChange,
  onClearInput,
  output,
  onClearOutput,
  activeTab: controlledTab,
  onActiveTabChange,
  problem,
}: MobileTabsProps) {
  const [internalTab, setInternalTab] = useState(problem ? "problem" : "editor");
  const activeTab = controlledTab ?? internalTab;
  const handleTabChange = onActiveTabChange ?? setInternalTab;

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
        <TabsList className={`grid w-full ${problem ? 'grid-cols-4' : 'grid-cols-3'} mb-3`}>
          {problem && (
            <TabsTrigger value="problem" className="flex items-center gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-accent" />
              <span>Problem</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="editor" className="flex items-center gap-1 text-xs">
            <Code className="h-3.5 w-3.5" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center gap-1 text-xs">
            <FileInput className="h-3.5 w-3.5" />
            <span>Input</span>
          </TabsTrigger>
          <TabsTrigger value="console" className="flex items-center gap-1 text-xs">
            <Terminal className="h-3.5 w-3.5" />
            <span>Console</span>
          </TabsTrigger>
        </TabsList>
        
        {problem && (
          <TabsContent value="problem" className="flex-1 mt-0 h-full overflow-hidden">
            <ProblemPanel
              problem={problem}
              onUseInput={(val) => {
                onInputChange(val);
                handleTabChange("input");
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="editor" className="flex-1 mt-0">
          <Editor
            code={code}
            onCodeChange={onCodeChange}
            language={language}
            onLanguageChange={onLanguageChange}
            onDetectLanguage={onDetectLanguage}
            isDetecting={isDetecting}
          />
        </TabsContent>
        
        <TabsContent value="input" className="flex-1 mt-0">
          <InputPanel
            input={input}
            onInputChange={onInputChange}
            onClearInput={onClearInput}
          />
        </TabsContent>
        
        <TabsContent value="console" className="flex-1 mt-0">
          <OutputConsole output={output} onClearOutput={onClearOutput} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
