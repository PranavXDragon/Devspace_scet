import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, FileInput } from "lucide-react";

interface InputPanelProps {
  input: string;
  onInputChange: (input: string) => void;
  onClearInput: () => void;
}

export default function InputPanel({ input, onInputChange, onClearInput }: InputPanelProps) {
  return (
    <Card className="flex-1 flex flex-col h-full bg-card/50 border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between p-2 sm:p-4 border-b">
        <div className="flex items-center gap-2">
          <FileInput className="h-4 w-4 text-primary" />
          <div className="text-lg font-semibold font-headline">Input</div>
          <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono">stdin</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClearInput}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Clear Input"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative flex flex-col min-h-0">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type program input here (e.g. 5 or hello for cin >> x or input())..."
          className="flex-1 w-full p-4 font-code text-base bg-transparent border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
          aria-label="Program Input"
        />
        <div className="px-3 py-1.5 border-t bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between select-none">
          <span>Piped to stdin (cin, scanf, input(), etc.)</span>
          {input.length > 0 && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {input.length} char{input.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
