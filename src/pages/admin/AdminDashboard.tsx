import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Clock, CheckCircle, TrendingUp, Play, Pause, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getQueues, serveNext, completeService, getServedStudents } from "@/api/mock";
import { Student } from "@/api/mock";
import { toast } from "sonner";
import StatsCard from "@/components/StatsCard";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState<Student[]>([]);
  const [served, setServed] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [servingStudent, setServingStudent] = useState<string | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [queueData, servedData] = await Promise.all([
        getQueues(),
        getServedStudents(),
      ]);
      setQueues(queueData);
      setServed(servedData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleServeNext = async (serviceType: string) => {
    setServingStudent(serviceType);
    try {
      const student = await serveNext(serviceType);
      if (student) {
        toast.success(`Now serving ${student.tokenNumber}`, {
          description: `Student directed to ${student.deskLocation}`,
        });
        await loadData();
      } else {
        toast.info(`No students waiting for ${serviceType}`);
      }
    } catch (error) {
      toast.error("Failed to serve next student");
    } finally {
      setServingStudent(null);
    }
  };

  const handleCompleteService = async (studentId: string, tokenNumber: string) => {
    try {
      await completeService(studentId);
      toast.success(`Completed service for ${tokenNumber}`);
      await loadData();
    } catch (error) {
      toast.error("Failed to complete service");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    navigate("/admin");
    toast.success("Logged out successfully");
  };

  const services = ["Transcript", "Registration", "ID Card"];
  const waitingByService = services.map(service => ({
    service,
    waiting: queues.filter(q => q.serviceType === service && q.status === "waiting").length,
    serving: queues.find(q => q.serviceType === service && q.status === "serving"),
  }));

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Waiting"
            value={queues.filter(q => q.status === "waiting").length}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Currently Serving"
            value={queues.filter(q => q.status === "serving").length}
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Served Today"
            value={served.length}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Avg. Wait Time"
            value={`${Math.round(queues.reduce((acc, q) => acc + q.estimatedWaitTime, 0) / (queues.length || 1))} min`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {waitingByService.map((item, index) => (
            <motion.div
              key={item.service}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 shadow-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{item.service}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.waiting} waiting
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.waiting > 0 ? 'bg-warning/20 text-warning-foreground' : 'bg-success/20 text-success-foreground'
                  }`}>
                    {item.waiting > 0 ? 'Active' : 'Clear'}
                  </div>
                </div>

                {item.serving && (
                  <div className="bg-primary/10 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-primary">
                      Now Serving: {item.serving.tokenNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.serving.deskLocation}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => handleCompleteService(item.serving!.id, item.serving!.tokenNumber)}
                    >
                      <CheckCircle className="mr-2 h-3 w-3" />
                      Complete Service
                    </Button>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleServeNext(item.service)}
                  disabled={servingStudent === item.service || item.waiting === 0}
                >
                  {servingStudent === item.service ? (
                    "Processing..."
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Serve Next
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-bold mb-4">Queue Overview</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No students in queue
                    </TableCell>
                  </TableRow>
                ) : (
                  queues.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.tokenNumber}</TableCell>
                      <TableCell>{student.serviceType}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'waiting' ? 'bg-warning/20 text-warning-foreground' :
                          student.status === 'serving' ? 'bg-success/20 text-success-foreground' :
                          'bg-muted'
                        }`}>
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell>{student.estimatedWaitTime} min</TableCell>
                      <TableCell>{student.deskLocation || "-"}</TableCell>
                      <TableCell>
                        {student.status === "serving" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteService(student.id, student.tokenNumber)}
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
