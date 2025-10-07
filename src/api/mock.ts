// Mock API service to simulate backend operations with Promise-based responses

export interface Student {
  id: string;
  tokenNumber: string;
  serviceType: string;
  timestamp: number;
  status: 'waiting' | 'serving' | 'served';
  estimatedWaitTime: number;
  deskLocation?: string;
  servedAt?: number;
  serviceDuration?: number;
}

export interface QueueStats {
  totalServed: number;
  averageWaitTime: number;
  peakHour: string;
  serviceBreakdown: { service: string; count: number }[];
}

// Simulate API latency
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize with mock students
const initializeQueues = (): Student[] => {
  const services = ['Transcript', 'Registration', 'ID Card'];
  const mockStudents: Student[] = [];
  
  for (let i = 1; i <= 5; i++) {
    mockStudents.push({
      id: `student-${i}`,
      tokenNumber: `Q${100 + i}`,
      serviceType: services[i % 3],
      timestamp: Date.now() - (i * 5 * 60 * 1000), // Stagger timestamps
      status: 'waiting',
      estimatedWaitTime: i * 5,
      deskLocation: undefined,
    });
  }
  
  return mockStudents;
};

// LocalStorage keys
const QUEUE_KEY = 'qms_queue';
const SERVED_KEY = 'qms_served';

// Get queues from localStorage or initialize
export const getQueues = async (): Promise<Student[]> => {
  await delay(800);
  
  const stored = localStorage.getItem(QUEUE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const initial = initializeQueues();
  localStorage.setItem(QUEUE_KEY, JSON.stringify(initial));
  return initial;
};

// Get served students
export const getServedStudents = async (): Promise<Student[]> => {
  await delay(500);
  
  const stored = localStorage.getItem(SERVED_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Add student to queue
export const addToQueue = async (serviceType: string): Promise<Student> => {
  await delay(1200);
  
  const queues = await getQueues();
  const tokenNumber = `Q${100 + queues.length + 1}`;
  
  const newStudent: Student = {
    id: `student-${Date.now()}`,
    tokenNumber,
    serviceType,
    timestamp: Date.now(),
    status: 'waiting',
    estimatedWaitTime: queues.filter(q => q.serviceType === serviceType && q.status === 'waiting').length * 5,
  };
  
  queues.push(newStudent);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));
  
  return newStudent;
};

// Serve next student
export const serveNext = async (serviceType: string): Promise<Student | null> => {
  await delay(1000);
  
  const queues = await getQueues();
  const nextStudent = queues.find(
    s => s.serviceType === serviceType && s.status === 'waiting'
  );
  
  if (!nextStudent) return null;
  
  nextStudent.status = 'serving';
  nextStudent.deskLocation = `Counter ${Math.floor(Math.random() * 5) + 1}`;
  
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));
  return nextStudent;
};

// Complete service
export const completeService = async (studentId: string): Promise<void> => {
  await delay(800);
  
  const queues = await getQueues();
  const served = await getServedStudents();
  
  const studentIndex = queues.findIndex(s => s.id === studentId);
  if (studentIndex === -1) return;
  
  const student = queues[studentIndex];
  student.status = 'served';
  student.servedAt = Date.now();
  student.serviceDuration = Math.round((student.servedAt - student.timestamp) / 1000 / 60); // minutes
  
  served.push(student);
  queues.splice(studentIndex, 1);
  
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queues));
  localStorage.setItem(SERVED_KEY, JSON.stringify(served));
};

// Remove student from queue
export const leaveQueue = async (studentId: string): Promise<void> => {
  await delay(600);
  
  const queues = await getQueues();
  const filtered = queues.filter(s => s.id !== studentId);
  
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
};

// Get queue statistics
export const getQueueStats = async (): Promise<QueueStats> => {
  await delay(1000);
  
  const served = await getServedStudents();
  
  const serviceBreakdown = served.reduce((acc, student) => {
    const existing = acc.find(item => item.service === student.serviceType);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ service: student.serviceType, count: 1 });
    }
    return acc;
  }, [] as { service: string; count: number }[]);
  
  const totalWaitTime = served.reduce((sum, s) => sum + (s.serviceDuration || 0), 0);
  const averageWaitTime = served.length > 0 ? Math.round(totalWaitTime / served.length) : 0;
  
  // Find peak hour (mock data)
  const peakHour = '10:00 AM - 11:00 AM';
  
  return {
    totalServed: served.length,
    averageWaitTime,
    peakHour,
    serviceBreakdown,
  };
};

// Pause/Resume queue (mock - just for UI state)
export const pauseQueue = async (serviceType: string, paused: boolean): Promise<void> => {
  await delay(500);
  // In a real app, this would update a queue status flag
  console.log(`Queue ${serviceType} ${paused ? 'paused' : 'resumed'}`);
};

// Authenticate admin (mock)
export const authenticateAdmin = async (username: string, password: string): Promise<boolean> => {
  await delay(1500);
  
  // Simple mock authentication
  return username === 'admin' && password === 'admin123';
};
