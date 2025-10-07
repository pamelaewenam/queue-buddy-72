import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, UserPlus, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { addToQueue } from "@/api/mock";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

const services = [
  {
    id: "transcript",
    name: "Transcript",
    icon: FileText,
    description: "Request official academic transcripts",
    color: "primary",
  },
  {
    id: "registration",
    name: "Registration",
    icon: UserPlus,
    description: "Course registration assistance",
    color: "secondary",
  },
  {
    id: "id-card",
    name: "ID Card",
    icon: CreditCard,
    description: "ID card issuance and renewal",
    color: "accent",
  },
];

const ServiceSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const handleServiceSelect = async (serviceType: string) => {
    setSelectedService(serviceType);
    setLoading(true);

    try {
      const student = await addToQueue(serviceType);
      toast.success(`You've joined the ${serviceType} queue!`, {
        description: `Your token number is ${student.tokenNumber}`,
      });
      navigate("/student/ticket", { state: { student } });
    } catch (error) {
      toast.error("Failed to join queue. Please try again.");
      setLoading(false);
      setSelectedService("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">Select a Service</h1>
          <p className="text-muted-foreground text-lg">
            Choose the service you need and get your queue ticket
          </p>
        </motion.div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-elevated transition-shadow cursor-pointer h-full flex flex-col">
                  <div className={`bg-${service.color}/10 w-16 h-16 rounded-xl flex items-center justify-center mb-4`}>
                    <service.icon className={`h-8 w-8 text-${service.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    {service.description}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => handleServiceSelect(service.name)}
                    disabled={selectedService === service.name}
                  >
                    {selectedService === service.name ? "Joining..." : "Join Queue"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelection;
