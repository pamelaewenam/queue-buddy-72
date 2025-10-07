import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

const StatsCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    default: "bg-gradient-card",
    primary: "bg-gradient-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 shadow-card hover:shadow-elevated transition-shadow ${variantStyles[variant]}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${variant === "default" ? "text-muted-foreground" : "opacity-90"}`}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className={`text-sm ${variant === "default" ? "text-muted-foreground" : "opacity-75"}`}>
                {trend}
              </p>
            )}
          </div>
          <div className={`rounded-lg p-3 ${variant === "default" ? "bg-primary/10" : "bg-white/20"}`}>
            <Icon className={`h-6 w-6 ${variant === "default" ? "text-primary" : "text-current"}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
