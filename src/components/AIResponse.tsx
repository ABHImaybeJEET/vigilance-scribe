import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Download, Copy, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIResponseProps {
  response: string;
  onNewReport: () => void;
}

export const AIResponse = ({ response, onNewReport }: AIResponseProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    toast({
      title: "Copied to clipboard",
      description: "Security guidance has been copied.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([response], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-guidance-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "Security guidance has been saved.",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-primary to-accent p-2">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Security Guidance</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-border hover:border-accent"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-border hover:border-accent"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/95 prose-strong:text-foreground prose-li:text-foreground/95">
          <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
            {response}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Disclaimer</p>
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                AI-generated guidance. For serious incidents, contact professionals.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Emergency Contact</p>
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                Report to local cyber crime authorities if needed
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Button
        onClick={onNewReport}
        variant="outline"
        className="w-full border-border hover:border-primary hover:bg-primary/5"
      >
        Submit New Report
      </Button>
    </div>
  );
};
