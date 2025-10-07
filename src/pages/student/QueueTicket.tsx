import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, MapPin, CheckCircle, RefreshCw, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getQueues, leaveQueue } from "@/api/mock";
import { Student } from "@/api/mock";
import { toast } from "sonner";

const QueueTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialStudent = location.state?.student;

  const [student, setStudent] = useState<Student | null>(initialStudent);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!student) {
      navigate("/student");
    }
  }, [student, navigate]);

  const handleRefresh = async () => {
    if (!student) return;

    setRefreshing(true);
    try {
      const queues = await getQueues();
      const updated = queues.find(s => s.id === student.id);
      
      if (!updated) {
        toast.info("You've been served! Thank you for waiting.");
        navigate("/student");
        return;
      }

      setStudent(updated);
      
      if (updated.status === "serving") {
        toast.success("It's your turn!", {
          description: `Please proceed to ${updated.deskLocation}`,
        });
      }
      
      toast.success("Queue status updated");
    } catch (error) {
      toast.error("Failed to refresh. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!student) return;

    try {
      await leaveQueue(student.id);
      toast.success("You've left the queue");
      navigate("/student");
    } catch (error) {
      toast.error("Failed to leave queue. Please try again.");
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/student")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <Card className="p-8 shadow-elevated border-2">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">You're Checked In!</h1>
              <p className="text-muted-foreground">Service: {student.serviceType}</p>
            </div>

            <div className="bg-gradient-primary rounded-xl p-8 text-center mb-6">
              <p className="text-primary-foreground/80 text-sm mb-2">Your Token Number</p>
              <h2 className="text-5xl font-bold text-primary-foreground mb-4">
                {student.tokenNumber}
              </h2>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                student.status === 'waiting' ? 'bg-warning/20 text-warning-foreground' :
                student.status === 'serving' ? 'bg-success/20 text-success-foreground' :
                'bg-muted/20'
              }`}>
                <span className="font-medium">
                  {student.status === 'waiting' ? 'Waiting' :
                   student.status === 'serving' ? 'Now Serving' :
                   'Completed'}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Estimated Wait Time</p>
                  <p className="text-2xl font-bold">{student.estimatedWaitTime} min</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Service Location</p>
                  <p className="text-2xl font-bold">
                    {student.deskLocation || "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {student.status === "serving" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6"
              >
                <p className="text-success font-bold text-center text-lg">
                  🎉 It's your turn! Please proceed to {student.deskLocation}
                </p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? "Refreshing..." : "Refresh Status"}
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLeaveQueue}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Queue
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-3">💡 Tips while waiting:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep this page open to receive real-time updates</li>
              <li>• You'll be notified when it's almost your turn</li>
              <li>• Please stay within the waiting area</li>
              <li>• Have your documents ready for faster service</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QueueTicket;
