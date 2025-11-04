import { useState, useEffect } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { ReportForm } from "@/components/ReportForm";
import { AIResponse } from "@/components/AIResponse";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateEnv } from "@/lib/env";
import heroImage from "@/assets/cyber-hero.jpg";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const categories = [
  {
    id: "phishing",
    name: "Phishing Attack",
    icon: "phishing",
    description: "Fraudulent emails or messages attempting to steal credentials or data",
  },
  {
    id: "ransomware",
    name: "Ransomware",
    icon: "ransomware",
    description: "Malicious software that encrypts data and demands payment",
  },
  {
    id: "identity_theft",
    name: "Identity Theft",
    icon: "identity_theft",
    description: "Unauthorized use of personal information for fraudulent purposes",
  },
  {
    id: "data_breach",
    name: "Data Breach",
    icon: "data_breach",
    description: "Unauthorized access to sensitive or confidential information",
  },
  {
    id: "malware",
    name: "Malware Infection",
    icon: "malware",
    description: "Malicious software designed to harm or exploit devices",
  },
  {
    id: "social_engineering",
    name: "Social Engineering",
    icon: "social_engineering",
    description: "Manipulation tactics to trick individuals into revealing information",
  },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const { isValid, errors } = validateEnv();
    if (!isValid) {
      console.error("Environment validation failed:", errors);
      setEnvError("Application configuration error. Please check environment variables.");
    }
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setAiResponse(null);
  };

  const handleSubmitReport = async (details: string, email: string) => {
    setIsLoading(true);
    
    // Retry logic for better reliability
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-report', {
          body: { category: selectedCategory, details, email }
        });

        if (error) {
          throw error;
        }

        if (!data || !data.response) {
          throw new Error('No response received from AI service');
        }

        setAiResponse(data.response);
        toast({
          title: "Analysis Complete",
          description: "AI-powered security guidance has been generated.",
        });
        setIsLoading(false);
        return; // Success, exit the function
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If this is the last attempt, show error
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    // All retries failed
    setIsLoading(false);
    
    let errorMessage = "Failed to analyze report. Please try again.";
    if (lastError?.message.includes('rate limit')) {
      errorMessage = "Service is currently busy. Please try again in a moment.";
    } else if (lastError?.message.includes('network') || lastError?.message.includes('fetch')) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (lastError?.message.includes('402') || lastError?.message.includes('payment')) {
      errorMessage = "AI service is temporarily unavailable. Please try again later.";
    }
    
    toast({
      title: "Unable to Complete Analysis",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleNewReport = () => {
    setSelectedCategory(null);
    setAiResponse(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight tracking-tight">
              AI Cyber Crime Reporter
            </h1>
            <p className="text-base md:text-lg text-foreground/90 max-w-2xl mx-auto font-medium leading-relaxed">
              Report cybersecurity incidents and receive instant AI-powered guidance
            </p>
          </div>
        </div>
      </div>

      {/* Environment Error Alert */}
      {envError && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{envError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          {!selectedCategory && !aiResponse && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-foreground tracking-tight">
                Select Incident Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category.name}
                    icon={category.icon}
                    description={category.description}
                    onClick={() => handleCategorySelect(category.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedCategory && !aiResponse && (
            <div className="max-w-2xl mx-auto">
              <ReportForm
                category={selectedCategory}
                onBack={() => setSelectedCategory(null)}
                onSubmit={handleSubmitReport}
                isLoading={isLoading}
              />
            </div>
          )}

          {aiResponse && (
            <div className="max-w-3xl mx-auto">
              <AIResponse response={aiResponse} onNewReport={handleNewReport} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
