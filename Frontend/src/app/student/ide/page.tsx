"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type { CodeFile } from "@/types";
import { detectLanguageAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { getSnippetForLanguage } from "@/utils/codeSnippets";
import { studentService } from "@/services/studentService";

import CodePadHeader from "@/components/ide/Header";
import Editor from "@/components/ide/Editor";
import OutputConsole from "@/components/ide/Console";
import InputPanel from "@/components/ide/InputPanel";
import MobileTabs from "@/components/ide/MobileTabs";
import ProblemPanel, { ProblemData } from "@/components/ide/ProblemPanel";
import SubmissionSuccessModal from "@/components/ide/SubmissionSuccessModal";
import { FileSaveDialog, FileOpenDialog } from "@/components/ide/FileManagement";
import { Loader2 } from "lucide-react";

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

function IdeContent() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get("problem") || searchParams.get("problemId");
  const { user } = useUser();
  const { toast } = useToast();

  const [code, setCode] = useState<string>(getSnippetForLanguage("javascript"));
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  // Problem-specific state
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [isProblemLoading, setIsProblemLoading] = useState(false);
  const [isProblemPanelOpen, setIsProblemPanelOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    problemTitle: string;
    xpAwarded: number;
  } | null>(null);

  const [mobileTab, setMobileTab] = useState<string>("editor");

  // Load problem details if query parameter is present
  useEffect(() => {
    if (!problemId) return;

    let isMounted = true;
    setIsProblemLoading(true);

    studentService
      .getProblem(problemId)
      .then((res: any) => {
        if (!isMounted) return;
        const problemData = res?.data || res;
        if (problemData && problemData.id) {
          setProblem(problemData);
          setIsProblemPanelOpen(true);
          setMobileTab("problem");

          // Check if starter code exists
          if (problemData.starter_code) {
            try {
              const starters =
                typeof problemData.starter_code === "string"
                  ? JSON.parse(problemData.starter_code)
                  : problemData.starter_code;

              if (starters && typeof starters === "object") {
                if (starters[language]) {
                  setCode(starters[language]);
                } else {
                  const availableLangs = Object.keys(starters);
                  if (availableLangs.length > 0) {
                    const firstLang = availableLangs[0];
                    setLanguage(firstLang);
                    setCode(starters[firstLang]);
                  }
                }
              }
            } catch (e) {
              console.warn("Could not parse starter_code json", e);
            }
          }
        }
      })
      .catch((err: any) => {
        console.error("Failed to load problem:", err);
        toast({
          variant: "destructive",
          title: "Problem Not Found",
          description: "Could not load the requested challenge details.",
        });
      })
      .finally(() => {
        if (isMounted) setIsProblemLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [problemId, toast]);

  // Load saved files from local storage
  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem("codepad_files");
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      }
    } catch (error) {
      console.error("Failed to load files from local storage", error);
    }
  }, []);

  const getInputHint = (sourceCode: string, lang: string) => {
    const normLang = lang.toLowerCase().trim();
    if (
      /cin\s*>>|scanf\s*\(|getline\s*\(/.test(sourceCode) ||
      normLang === "c++" ||
      normLang === "cpp" ||
      normLang === "c"
    ) {
      return 'Your program reads standard input via cin / scanf. To test custom numbers or strings, type them in the "Input" panel and click Run.';
    }
    if (/input\s*\(|sys\.stdin/.test(sourceCode) || normLang === "python") {
      return 'Your program reads input via input(). To pass values to your code, type them in the "Input" panel and click Run.';
    }
    if (
      /Scanner\s+|BufferedReader\s+|System\.in/.test(sourceCode) ||
      normLang === "java"
    ) {
      return 'Your program reads input via Scanner / System.in. To pass values, enter them in the "Input" panel and click Run.';
    }
    return 'Your program expects user input. Type your input values in the "Input" panel and click Run.';
  };

  const handleRunCode = async () => {
    setOutput(["Executing code..."]);
    setMobileTab("console"); // Switch to console tab on mobile

    const normLang = language.toLowerCase().trim();
    const judge0Id = JUDGE0_LANGUAGE_IDS[normLang];

    // 1. Direct High-Speed Cloud Sandbox (Judge0)
    if (judge0Id) {
      try {
        const b64Source = btoa(unescape(encodeURIComponent(code)));
        const b64Stdin = input ? btoa(unescape(encodeURIComponent(input))) : "";

        const directRes = await fetch(
          "https://ce.judge0.com/submissions?wait=true&base64_encoded=true",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source_code: b64Source,
              language_id: judge0Id,
              stdin: b64Stdin,
            }),
          }
        );

        if (directRes.ok) {
          const data = await directRes.json();
          const decode = (str?: string | null) => {
            if (!str) return "";
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
          if (stdout)
            lines.push(
              ...stdout.split("\n").filter((l: string) => l.trim() !== "")
            );
          if (compileOutput)
            lines.push(
              ...compileOutput
                .split("\n")
                .filter((l: string) => l.trim() !== "")
                .map((l: string) => `Compile: ${l}`)
            );
          if (stderr)
            lines.push(
              ...stderr
                .split("\n")
                .filter((l: string) => l.trim() !== "")
                .map((l: string) => `Error: ${l}`)
            );
          if (message) lines.push(`Note: ${message}`);

          const hasInputOperation =
            /cin\s*>>|scanf\s*\(|getline\s*\(|input\s*\(|Scanner\s+|readline\s*\(|BufferedReader\s+|gets\s*\(|System\.in/i.test(
              code
            );
          if (!input?.trim() && hasInputOperation) {
            lines.push(`__IDE_TIP__:${getInputHint(code, language)}`);
          }

          setOutput(
            lines.length > 0
              ? lines
              : ["Program executed successfully with no output."]
          );
          return;
        }
      } catch (directErr) {
        console.warn("Direct execution fallback to server route:", directErr);
      }
    }

    // 2. Fallback: DevSpace API Route
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute code");
      }

      const result = await response.json();

      const combinedOutput = [
        ...(result.output || []).filter((line: string) => line.trim() !== ""),
        ...(result.error || [])
          .filter((line: string) => line.trim() !== "")
          .map((line: string) => `Error: ${line}`),
      ];

      const hasInputOperation =
        /cin\s*>>|scanf\s*\(|getline\s*\(|input\s*\(|Scanner\s+|readline\s*\(|BufferedReader\s+|gets\s*\(|System\.in/i.test(
          code
        );
      if (!input?.trim() && hasInputOperation) {
        combinedOutput.push(`__IDE_TIP__:${getInputHint(code, language)}`);
      }

      setOutput(
        combinedOutput.length > 0
          ? combinedOutput
          : ["Code executed successfully."]
      );
    } catch (error: any) {
      console.error("Execution error:", error);
      setOutput([`Error: ${error.message || "Failed to execute code"}`]);
      toast({
        variant: "destructive",
        title: "Execution Error",
        description: error.message || "Failed to execute code",
      });
    }
  };

  // Submit Solution for current problem
  const handleSubmitProblem = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Solution",
        description: "Please write your code before submitting.",
      });
      return;
    }

    if (!problem) return;

    setIsSubmitting(true);
    setOutput(["Testing solution against problem testcases..."]);
    setMobileTab("console");

    try {
      const normLang = language.toLowerCase().trim();
      const judge0Id = JUDGE0_LANGUAGE_IDS[normLang];
      let submissionStatus = "Accepted";
      let testFailureReason = "";

      // Test against sample testcase if available
      const sampleCase = problem.testcases?.[0];
      if (judge0Id && sampleCase) {
        try {
          const b64Source = btoa(unescape(encodeURIComponent(code)));
          const b64Stdin = sampleCase.input_data
            ? btoa(unescape(encodeURIComponent(sampleCase.input_data)))
            : "";

          const directRes = await fetch(
            "https://ce.judge0.com/submissions?wait=true&base64_encoded=true",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source_code: b64Source,
                language_id: judge0Id,
                stdin: b64Stdin,
              }),
            }
          );

          if (directRes.ok) {
            const data = await directRes.json();
            const decode = (str?: string | null) =>
              str ? decodeURIComponent(escape(atob(str))) : "";
            const stdout = decode(data.stdout)?.trim();
            const stderr = decode(data.stderr)?.trim();
            const compileOutput = decode(data.compile_output)?.trim();

            if (compileOutput || (stderr && !stdout)) {
              submissionStatus = "Compilation Error";
              testFailureReason = compileOutput || stderr;
            } else if (stderr) {
              submissionStatus = "Runtime Error";
              testFailureReason = stderr;
            } else if (
              sampleCase.expected_output &&
              stdout !== sampleCase.expected_output.trim()
            ) {
              submissionStatus = "Wrong Answer";
              testFailureReason = `Sample Testcase 1 failed.\nExpected: "${sampleCase.expected_output.trim()}"\nGot: "${stdout}"`;
            }
          }
        } catch (execErr) {
          console.warn("Direct execution test note:", execErr);
        }
      }

      // Record submission with Backend
      const studentEmail =
        user?.primaryEmailAddress?.emailAddress || undefined;

      const submitRes: any = await studentService.submitProblem(problem.id, {
        sourceCode: code,
        language,
        status: submissionStatus,
        studentEmail,
      });

      const resData = submitRes?.data || submitRes;

      if (submissionStatus === "Accepted") {
        const xp =
          resData?.xpAwarded ||
          (problem.difficulty === "Hard"
            ? 100
            : problem.difficulty === "Medium"
            ? 50
            : 25);

        setOutput([
          "🎉 Accepted!",
          `All testcases passed successfully.`,
          `+${xp} XP awarded to your profile!`,
        ]);

        setSuccessModalData({
          isOpen: true,
          problemTitle: problem.title,
          xpAwarded: xp,
        });

        toast({
          title: "Solution Accepted! 🎉",
          description: `+${xp} XP earned! Keep up the momentum.`,
        });
      } else {
        setOutput([
          `❌ Submission: ${submissionStatus}`,
          testFailureReason || "One or more testcases failed.",
          "Check the problem requirements and test cases, then try again.",
        ]);

        toast({
          variant: "destructive",
          title: `Submission: ${submissionStatus}`,
          description:
            testFailureReason.slice(0, 120) ||
            "Some test cases did not pass. Check the console for details.",
        });
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description:
          err.response?.data?.message ||
          err.message ||
          "Could not submit solution.",
      });
      setOutput([`Error: ${err.message || "Failed to submit solution"}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFile = (fileName: string) => {
    try {
      const newFile: CodeFile = {
        name: fileName,
        content: code,
        language,
        lastModified: Date.now(),
      };
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
      toast({
        title: "File Saved",
        description: `"${fileName}" has been saved.`,
      });
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
    setCode(getSnippetForLanguage(language));
    setOutput([]);
    setInput("");
    setActiveFile(null);
  };

  const handleClearInput = () => {
    setInput("");
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    // If a problem has language-specific starter code, load it
    if (problem?.starter_code) {
      try {
        const starters =
          typeof problem.starter_code === "string"
            ? JSON.parse(problem.starter_code)
            : problem.starter_code;
        if (starters?.[newLanguage]) {
          setCode(starters[newLanguage]);
          return;
        }
      } catch (e) {}
    }

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
        const detectedLang = result.language.toLowerCase().split(" ")[0];
        const supportedLangs = [
          "javascript",
          "typescript",
          "python",
          "java",
          "c",
          "c++",
          "c#",
          "go",
          "rust",
          "php",
          "ruby",
          "kotlin",
          "r",
          "bash",
        ];

        let normalizedLang = detectedLang;
        if (detectedLang === "js") normalizedLang = "javascript";
        if (detectedLang === "ts") normalizedLang = "typescript";
        if (detectedLang === "py") normalizedLang = "python";
        if (detectedLang === "cpp" || detectedLang === "cxx")
          normalizedLang = "c++";
        if (detectedLang === "csharp") normalizedLang = "c#";
        if (detectedLang === "golang") normalizedLang = "go";
        if (detectedLang === "shell" || detectedLang === "sh")
          normalizedLang = "bash";

        if (supportedLangs.includes(normalizedLang)) {
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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <CodePadHeader
        onNew={handleNewFile}
        onOpen={() => setIsOpenDialogOpen(true)}
        onSave={() => setIsSaveDialogOpen(true)}
        onRun={handleRunCode}
        onSubmit={handleSubmitProblem}
        isSubmitting={isSubmitting}
        activeFile={activeFile}
        hasProblem={!!problem}
        problemTitle={problem?.title}
        isProblemPanelOpen={isProblemPanelOpen}
        onToggleProblemPanel={() => setIsProblemPanelOpen(!isProblemPanelOpen)}
      />

      {/* Mobile Layout - Tab Switching */}
      <main className="flex-1 lg:hidden p-3 overflow-hidden">
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
          onClearOutput={handleClearOutput}
          activeTab={mobileTab}
          onActiveTabChange={setMobileTab}
          problem={problem}
        />
      </main>

      {/* Desktop Layout */}
      <main className="hidden lg:grid grid-cols-12 gap-3.5 p-3.5 overflow-hidden flex-1">
        {/* Left: Problem Panel (if problem loaded & panel open) */}
        {problem && isProblemPanelOpen && (
          <div className="col-span-12 xl:col-span-4 lg:col-span-4 min-h-0 min-w-0 h-full overflow-hidden">
            <ProblemPanel
              problem={problem}
              onUseInput={(val) => setInput(val)}
              onClose={() => setIsProblemPanelOpen(false)}
            />
          </div>
        )}

        {/* Center: Code Editor */}
        <div
          className={`flex flex-col min-h-0 min-w-0 ${
            problem && isProblemPanelOpen
              ? "xl:col-span-5 lg:col-span-5 col-span-12"
              : "col-span-8"
          }`}
        >
          <Editor
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={handleLanguageChange}
            onDetectLanguage={handleDetectLanguage}
            isDetecting={isDetecting}
          />
        </div>

        {/* Right: Input & Output Console */}
        <div
          className={`flex flex-col gap-3.5 min-h-0 min-w-0 ${
            problem && isProblemPanelOpen
              ? "xl:col-span-3 lg:col-span-3 col-span-12"
              : "col-span-4"
          }`}
        >
          <div className="flex-1 min-h-0">
            <InputPanel
              input={input}
              onInputChange={setInput}
              onClearInput={handleClearInput}
            />
          </div>
          <div className="flex-1 min-h-0">
            <OutputConsole output={output} onClearOutput={handleClearOutput} />
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

      {/* Success Modal */}
      {successModalData && (
        <SubmissionSuccessModal
          isOpen={successModalData.isOpen}
          onClose={() => setSuccessModalData(null)}
          problemTitle={successModalData.problemTitle}
          xpAwarded={successModalData.xpAwarded}
        />
      )}
    </div>
  );
}

export default function IdePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-background text-text">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm font-medium text-text-muted">Loading IDE environment...</p>
          </div>
        </div>
      }
    >
      <IdeContent />
    </Suspense>
  );
}
