
"use client";

import { useState, useEffect } from "react";
import type { CodeFile } from "@/types";
import { detectLanguageAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { getSnippetForLanguage } from "@/utils/codeSnippets";

import CodePadHeader from "@/components/ide/Header";
import Editor from "@/components/ide/Editor";
import OutputConsole from "@/components/ide/Console";
import InputPanel from "@/components/ide/InputPanel";
import MobileTabs from "@/components/ide/MobileTabs";
import { FileSaveDialog, FileOpenDialog } from "@/components/ide/FileManagement";

export default function Home() {
  const [code, setCode] = useState<string>(getSnippetForLanguage("javascript"));
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem("codepad_files");
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      }
    } catch (error) {
      console.error("Failed to load files from local storage", error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: "Could not load files from local storage.",
      });
    }
  }, [toast]);

  const [mobileTab, setMobileTab] = useState<string>("editor");

  const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
    javascript: 93, // Node.js 18.15.0
    typescript: 94, // TypeScript 5.0.3
    python: 71,     // Python 3.8.1
    java: 91,       // Java JDK 17.0.6
    c: 103,         // C GCC 14.1.0
    'c++': 54,      // C++ GCC 9.2.0
    cpp: 54,
    rust: 73,       // Rust 1.40.0
    php: 98,        // PHP 8.3.11
    ruby: 72,       // Ruby 2.7.0
    kotlin: 78,     // Kotlin 1.3.70
    r: 99,          // R 4.4.1
    bash: 46,       // Bash 5.0.0
    'c#': 51,       // C# Mono 6.6.0
    csharp: 51,
    go: 95,         // Go 1.18.5
  };

  const handleRunCode = async () => {
    setOutput(['Executing code...']);
    setMobileTab('console'); // On mobile devices, instantly switch to console tab
    
    const normLang = language.toLowerCase().trim();
    const judge0Id = JUDGE0_LANGUAGE_IDS[normLang];

    // 1. Try Direct High-Speed Cloud Sandbox (Direct client-to-Judge0 with zero Vercel cold start)
    if (judge0Id) {
      try {
        const b64Source = btoa(unescape(encodeURIComponent(code)));
        const b64Stdin = input ? btoa(unescape(encodeURIComponent(input))) : '';

        const directRes = await fetch('https://ce.judge0.com/submissions?wait=true&base64_encoded=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_code: b64Source,
            language_id: judge0Id,
            stdin: b64Stdin,
          }),
        });

        if (directRes.ok) {
          const data = await directRes.json();
          const decode = (str?: string | null) => {
            if (!str) return '';
            try {
              return decodeURIComponent(escape(atob(str)));
            } catch (e) {
              return str;
            }
          };

          const stdout = decode(data.stdout);
          const stderr = decode(data.stderr);
          const compileOutput = decode(data.compile_output);
          const message = decode(data.message);

          const lines: string[] = [];
          if (stdout) lines.push(...stdout.split('\n').filter((l: string) => l.trim() !== ''));
          if (compileOutput) lines.push(...compileOutput.split('\n').filter((l: string) => l.trim() !== '').map((l: string) => `Compile: ${l}`));
          if (stderr) lines.push(...stderr.split('\n').filter((l: string) => l.trim() !== '').map((l: string) => `Error: ${l}`));
          if (message) lines.push(`Note: ${message}`);

          const hasInputOperation = /cin\s*>>|scanf\s*\(|input\s*\(|Scanner\s+|readline\s*\(/.test(code);
          if (!input?.trim() && hasInputOperation) {
            lines.push('\n[💡 Tip: To pass values into cin >> i, type your number/text in the "Input" panel above and click Run]');
          }

          setOutput(lines.length > 0 ? lines : ['Program executed successfully with no output.']);
          return;
        }
      } catch (directErr) {
        console.warn('Direct execution fallback to server route:', directErr);
      }
    }

    // 2. Fallback: DevSpace API Route
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const result = await response.json();
      
      const combinedOutput = [
        ...(result.output || []).filter((line: string) => line.trim() !== ''),
        ...(result.error || []).filter((line: string) => line.trim() !== '').map((line: string) => `Error: ${line}`)
      ];

      const hasInputOperation = /cin\s*>>|scanf\s*\(|input\s*\(|Scanner\s+|readline\s*\(/.test(code);
      if (!input?.trim() && hasInputOperation) {
        combinedOutput.push('\n[💡 Tip: To pass values into cin >> i, type your number/text in the "Input" panel above and click Run]');
      }
      
      setOutput(combinedOutput.length > 0 ? combinedOutput : ['Code executed successfully.']);
    } catch (error: any) {
      console.error('Execution error:', error);
      setOutput([`Error: ${error.message || 'Failed to execute code'}`]);
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: error.message || 'Failed to execute code',
      });
    }
  };

  const handleSaveFile = (fileName: string) => {
    try {
      const newFile: CodeFile = { name: fileName, content: code, language, lastModified: Date.now() };
      let updatedFiles = [...files];
      const existingFileIndex = files.findIndex((f) => f.name === fileName);

      if (existingFileIndex > -1) {
        updatedFiles[existingFileIndex] = newFile;
      } else {
        updatedFiles.push(newFile);
      }
      
      setFiles(updatedFiles);
      localStorage.setItem("codepad_files", JSON.stringify(updatedFiles));
      setActiveFile(fileName);
      setIsSaveDialogOpen(false);
    } catch (error) {
       console.error("Failed to save file", error);
       toast({
        variant: "destructive",
        title: "Error saving file",
        description: "Could not save file to local storage.",
      });
    }
  };

  const handleLoadFile = (file: CodeFile) => {
    setCode(file.content);
    setLanguage(file.language);
    setActiveFile(file.name);
    setIsOpenDialogOpen(false);
  };

  const handleNewFile = () => {
    setCode(getSnippetForLanguage("javascript"));
    setLanguage("javascript");
    setOutput([]);
    setInput("");
    setActiveFile(null);
  };

  const handleClearInput = () => {
    setInput("");
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!activeFile) {
      setCode(getSnippetForLanguage(newLanguage));
    }
  };
  
  const handleDetectLanguage = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Empty code",
        description: "Cannot detect language of empty code snippet.",
      });
      return;
    }
    setIsDetecting(true);
    try {
      const result = await detectLanguageAction({ code });
      if (result && result.language) {
        const detectedLang = result.language.toLowerCase().split(' ')[0];
        const supportedLangs = [
          "javascript", "typescript", "python", "java", "c", "c++", "c#", 
          "go", "rust", "php", "ruby", "kotlin", "r", "bash"
        ];
        
        let normalizedLang = detectedLang;
        if (detectedLang === "js") normalizedLang = "javascript";
        if (detectedLang === "ts") normalizedLang = "typescript";
        if (detectedLang === "py") normalizedLang = "python";
        if (detectedLang === "cpp" || detectedLang === "cxx") normalizedLang = "c++";
        if (detectedLang === "csharp") normalizedLang = "c#";
        if (detectedLang === "golang") normalizedLang = "go";
        if (detectedLang === "shell" || detectedLang === "sh") normalizedLang = "bash";
        
        if(supportedLangs.includes(normalizedLang)) {
          setLanguage(normalizedLang);
        } else {
          setLanguage("javascript");
        }
      } else {
        throw new Error("Could not determine language.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Detection Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <CodePadHeader
        onNew={handleNewFile}
        onOpen={() => setIsOpenDialogOpen(true)}
        onSave={() => setIsSaveDialogOpen(true)}
        onRun={handleRunCode}
        activeFile={activeFile}
      />
      {/* Mobile Layout - Tab Switching */}
      <main className="flex-1 lg:hidden p-4 overflow-hidden">
        <MobileTabs
          code={code}
          onCodeChange={setCode}
          language={language}
          onLanguageChange={handleLanguageChange}
          onDetectLanguage={handleDetectLanguage}
          isDetecting={isDetecting}
          input={input}
          onInputChange={setInput}
          onClearInput={handleClearInput}
          output={output}
          activeTab={mobileTab}
          onActiveTabChange={setMobileTab}
        />
      </main>

      {/* Desktop Layout - Side by Side */}
      <main className="hidden lg:grid lg:grid-cols-3 gap-4 p-4 overflow-hidden flex-1">
        <div className="flex flex-col min-h-0 min-w-0 lg:col-span-2">
          <Editor
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onDetectLanguage={handleDetectLanguage}
            isDetecting={isDetecting}
          />
        </div>
        <div className="flex flex-col gap-4 min-h-0 min-w-0">
          <div className="flex-1">
            <InputPanel
              input={input}
              onInputChange={setInput}
              onClearInput={handleClearInput}
            />
          </div>
          <div className="flex-1">
            <OutputConsole output={output} />
          </div>
        </div>
      </main>

      <FileSaveDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveFile}
        defaultFileName={activeFile}
      />
      <FileOpenDialog
        isOpen={isOpenDialogOpen}
        onOpenChange={setIsOpenDialogOpen}
        files={files}
        onLoad={handleLoadFile}
        setFiles={setFiles}
      />
    </div>
  );
}
