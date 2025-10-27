import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface AIResponseProps {
  response: string;
  onNewReport: () => void;
}

export const AIResponse = ({ response, onNewReport }: AIResponseProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-primary to-accent p-2">
            <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">AI Security Guidance</h2>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {response}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This guidance is AI-generated and should be used as a starting point. For serious incidents, 
              please contact law enforcement and cybersecurity professionals.
            </p>
          </div>
        </div>
      </Card>

      <Button
        onClick={onNewReport}
        variant="outline"
        className="w-full border-border hover:border-primary"
      >
        Submit Another Report
      </Button>
    </div>
  );
};
