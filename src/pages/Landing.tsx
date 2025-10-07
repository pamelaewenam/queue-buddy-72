import { motion } from "framer-motion";
import { Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Queue Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Streamline your service experience with intelligent queue management
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-elevated hover:shadow-2xl transition-all border border-border h-full flex flex-col">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Student Portal</h2>
              <p className="text-muted-foreground mb-6 flex-grow">
                Join a queue, get your ticket number, and track your waiting time in real-time.
              </p>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/student")}
              >
                Enter Student Portal
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-elevated hover:shadow-2xl transition-all border border-border h-full flex flex-col">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Admin Portal</h2>
              <p className="text-muted-foreground mb-6 flex-grow">
                Manage queues, serve students, and view comprehensive analytics.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full"
                onClick={() => navigate("/admin")}
              >
                Enter Admin Portal
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p>Powered by modern web technologies • Real-time updates • Seamless experience</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
