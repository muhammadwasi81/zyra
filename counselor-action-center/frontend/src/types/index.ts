export type EnrollmentStatus = "active" | "at_risk" | "inactive";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  gpa: number;
  counselorId: string;
  enrollmentStatus: EnrollmentStatus;
}

export interface Task {
  id: string;
  studentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  studentId: string;
  from: string;
  subject: string;
  preview: string;
  read: boolean;
  receivedAt: string;
}

export interface ActionCenterSummary {
  totalTasks: number;
  completedTasks: number;
  urgentTasks: number;
  unreadMessages: number;
  urgencyLevel: UrgencyLevel;
}

export interface ActionCenterData {
  student: Student;
  tasks: Task[];
  messages: Message[];
  summary: ActionCenterSummary;
}
