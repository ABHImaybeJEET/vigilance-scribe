import { useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { ReportForm } from "@/components/ReportForm";
import { AIResponse } from "@/components/AIResponse";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/cyber-hero.jpg";

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
  const { toast } = useToast();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setAiResponse(null);
  };

  const handleSubmitReport = async (details: string, email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-report', {
        body: { category: selectedCategory, details, email }
      });

      if (error) {
        throw error;
      }

      setAiResponse(data.response);
      toast({
        title: "Analysis Complete",
        description: "AI-powered security guidance has been generated.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewReport = () => {
    setSelectedCategory(null);
    setAiResponse(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Cyber Crime Reporter
            </h1>
            <p className="text-xl text-muted-foreground">
              Report cybersecurity incidents and receive instant AI-powered guidance on how to protect yourself
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {!selectedCategory && !aiResponse && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
                Select Incident Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
