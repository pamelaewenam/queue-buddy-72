import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getQueueStats, getServedStudents } from "@/api/mock";
import { QueueStats } from "@/api/mock";
import { toast } from "sonner";
import StatsCard from "@/components/StatsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(215, 70%, 50%)', 'hsl(174, 62%, 47%)', 'hsl(38, 92%, 50%)'];

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin");
      return;
    }

    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const data = await getQueueStats();
      setStats(data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!stats) return;

    const report = {
      generatedAt: new Date().toISOString(),
      stats,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `queue-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Students Served"
            value={stats.totalServed}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Average Wait Time"
            value={`${stats.averageWaitTime} min`}
            icon={Clock}
            variant="success"
          />
          <StatsCard
            title="Peak Hours"
            value={stats.peakHour}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-bold mb-6">Service Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.serviceBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="service" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-bold mb-6">Service Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ service, count }) => `${service}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-bold mb-4">Performance Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {stats.serviceBreakdown.map((item, index) => (
              <div
                key={item.service}
                className="p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <h4 className="font-semibold">{item.service}</h4>
                </div>
                <p className="text-2xl font-bold mb-1">{item.count}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round((item.count / stats.totalServed) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-card mt-6 bg-muted/30">
          <h3 className="font-semibold mb-3">📊 Key Insights</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {stats.totalServed} students have been served successfully</li>
            <li>• Average waiting time is {stats.averageWaitTime} minutes</li>
            <li>• Peak service hours are during {stats.peakHour}</li>
            <li>• Most requested service: {stats.serviceBreakdown.sort((a, b) => b.count - a.count)[0]?.service || 'N/A'}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
