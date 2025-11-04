import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, FileText, AlertCircle } from "lucide-react";
import { reportFormSchema, sanitizeInput } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Predefined example problems for each category
const exampleProblems: Record<string, string[]> = {
  phishing: [
    "Received suspicious email claiming to be from my bank asking for account verification",
    "Got text message with link saying my package delivery failed, looks fake",
    "Email from 'PayPal' asking to confirm payment, but sender address looks wrong"
  ],
  ransomware: [
    "Computer files encrypted, screen shows ransom demand for Bitcoin payment",
    "Cannot access any documents, desktop shows threatening message demanding money",
    "All photos and files locked, attackers want payment to restore access"
  ],
  identity_theft: [
    "Found unauthorized credit cards opened in my name",
    "Receiving calls about purchases I never made",
    "Bank account shows transactions I didn't authorize"
  ],
  data_breach: [
    "Company database compromised, customer information exposed",
    "Received notification that my data was part of a breach",
    "Personal information posted on dark web forums"
  ],
  malware: [
    "Computer running extremely slow, suspicious processes in background",
    "Pop-ups appearing constantly, browser redirecting to strange sites",
    "Antivirus detected multiple threats, system behaving abnormally"
  ],
  social_engineering: [
    "Caller claimed to be tech support, asked for remote access to computer",
    "Someone impersonating company CEO requested urgent wire transfer",
    "Received call about winning prize, asking for personal information"
  ]
};

interface ReportFormProps {
  category: string;
  onBack: () => void;
  onSubmit: (details: string, email: string) => void;
  isLoading: boolean;
}

export const ReportForm = ({ category, onBack, onSubmit, isLoading }: ReportFormProps) => {
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validate form data
    const formData = {
      details: sanitizeInput(details),
      email: email.trim(),
      category: category
    };
    
    try {
      reportFormSchema.parse(formData);
      onSubmit(formData.details, formData.email);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || "Please check your input and try again";
      setValidationError(errorMessage);
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const examples = exampleProblems[category] || [];
  
  const handleExampleClick = (example: string) => {
    setDetails(example);
    setShowExamples(false);
    setValidationError(null);
  };
  
  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetails(e.target.value);
    setValidationError(null);
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm p-6">
      <Button
        variant="ghost"
        onClick={onBack}
        size="sm"
        className="mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h2 className="mb-4 text-xl font-bold text-foreground tracking-tight">
        Report {category.replace(/_/g, " ")}
      </h2>
      
      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
            Your Email (Optional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            className="bg-secondary border-input text-sm font-medium"
          />
          <p className="text-xs text-muted-foreground font-medium">
            We'll send you a copy of the guidance
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="details" className="text-sm">Incident Details</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowExamples(!showExamples)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <FileText className="mr-1 h-3 w-3" />
              {showExamples ? "Hide" : "Show"} Examples
            </Button>
          </div>
          
          {showExamples && examples.length > 0 && (
            <div className="space-y-2 p-3 bg-secondary/50 rounded-md border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Click an example to use it:</p>
              {examples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left text-xs p-2 rounded bg-background hover:bg-accent transition-colors border border-border/30"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
          
          <Textarea
            id="details"
            placeholder="Please describe the incident in detail (minimum 20 characters)..."
            value={details}
            onChange={handleDetailsChange}
            required
            minLength={20}
            maxLength={5000}
            rows={6}
            className="bg-secondary border-input resize-none text-sm font-medium leading-relaxed"
          />
          <div className="flex justify-between items-center">
            <p className={`text-xs font-semibold ${details.length < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {details.length}/20 characters minimum
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Max: 5000 characters
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || details.trim().length < 20}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Analyzing your report...
            </span>
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
