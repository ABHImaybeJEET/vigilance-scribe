import { Shield, Lock, AlertTriangle, Database, Bug, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  category: string;
  icon: string;
  description: string;
  onClick: () => void;
}

const iconMap = {
  phishing: Shield,
  ransomware: Lock,
  identity_theft: AlertTriangle,
  data_breach: Database,
  malware: Bug,
  social_engineering: Users,
};

export const CategoryCard = ({ category, icon, description, onClick }: CategoryCardProps) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Shield;

  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm p-5 cursor-pointer transition-all hover:border-primary hover:shadow-[0_0_20px_hsl(var(--cyber-glow)/0.3)] hover:scale-[1.02]"
    >
      <div className="relative z-10">
        <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-primary to-accent p-2.5 text-primary-foreground shadow-glow">
          <IconComponent className="h-5 w-5" />
        </div>
        <h3 className="mb-1.5 text-lg font-semibold text-foreground">{category}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
};
