import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Terminal, Lightbulb, Copy, Check, Trash2 } from "lucide-react";

interface OutputConsoleProps {
  output: string[];
  onClearOutput?: () => void;
}

export default function OutputConsole({ output, onClearOutput }: OutputConsoleProps) {
  const [copied, setCopied] = useState(false);

  const tips: string[] = [];
  const displayLines: string[] = [];

  output.forEach((line) => {
    if (line.startsWith("__IDE_TIP__:")) {
      tips.push(line.replace("__IDE_TIP__:", "").trim());
    } else if (line.includes("💡 Tip:")) {
      const cleaned = line.replace(/^\s*\[?\s*💡\s*Tip:\s*/i, "").replace(/\]\s*$/, "").trim();
      tips.push(cleaned);
    } else {
      displayLines.push(line);
    }
  });

  const rawOutputText = displayLines.join("\n");

  const handleCopy = async () => {
    if (!rawOutputText) return;
    try {
      await navigator.clipboard.writeText(rawOutputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy output", e);
    }
  };

  return (
    <Card className="flex-1 flex flex-col h-full bg-card/50 border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-2 sm:p-4 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <div className="text-lg font-semibold font-headline">Console</div>
        </div>
        <div className="flex items-center gap-1">
          {rawOutputText && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Copy Output"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
          {onClearOutput && output.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearOutput}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Clear Console"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative flex flex-col">
        <ScrollArea className="absolute inset-0 w-full h-full p-4">
          {displayLines.length > 0 ? (
            <div className="font-code text-sm space-y-1">
              {displayLines.map((line, idx) => {
                const isError = line.startsWith("Error:");
                const isCompile = line.startsWith("Compile:");
                const isNote = line.startsWith("Note:");

                return (
                  <div
                    key={idx}
                    className={`whitespace-pre-wrap break-words leading-relaxed ${
                      isError
                        ? "text-rose-400 font-medium"
                        : isCompile
                        ? "text-amber-400 font-mono"
                        : isNote
                        ? "text-sky-400"
                        : "text-accent"
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground font-code">
              Output will appear here...
            </div>
          )}

          {tips.length > 0 && (
            <div className="mt-4 space-y-2">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 leading-relaxed">
                    <span className="font-semibold text-amber-300 mr-1.5">Input Tip:</span>
                    <span className="text-amber-100/90">{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

