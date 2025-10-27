import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";

interface ReportFormProps {
  category: string;
  onBack: () => void;
  onSubmit: (details: string, email: string) => void;
  isLoading: boolean;
}

export const ReportForm = ({ category, onBack, onSubmit, isLoading }: ReportFormProps) => {
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details, email);
  };

  return (
    <Card className="border-border bg-card p-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Categories
      </Button>

      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Report {category.replace(/_/g, " ")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Your Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Incident Details</Label>
          <Textarea
            id="details"
            placeholder="Please describe the incident in detail..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={8}
            className="bg-secondary border-input resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
        >
          {isLoading ? (
            "Analyzing..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Get AI Solution
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
