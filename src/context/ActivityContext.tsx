import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ActivityType = 'quiz' | 'scan' | 'chat';
export type ActivityStatus = 'in_progress' | 'completed';

export interface Activity {
  id: string;
  type: ActivityType;
  subject?: string;
  score?: number;
  total?: number;
  timestamp: number;
  status: ActivityStatus;
  data?: any; // Stores internal state (e.g., questions, current index)
}

interface ActivityContextType {
  activities: Activity[];
  points: number;
  studyTime: number; // in seconds
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  clearActivities: () => void;
  addPoints: (amount: number) => void;
  resumeActivity: (id: string) => Activity | undefined;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("prep-ia-activities");
    return saved ? JSON.parse(saved) : [];
  });

  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem("prep-ia-points");
    return saved ? parseInt(saved) : 0;
  });

  const [studyTime, setStudyTime] = useState<number>(() => {
    const saved = localStorage.getItem("prep-ia-time");
    return saved ? parseInt(saved) : 0;
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem("prep-ia-activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("prep-ia-points", points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem("prep-ia-time", studyTime.toString());
  }, [studyTime]);

  // Global study timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Only count time if tab is active (simple heuristic)
      if (!document.hidden) {
        setStudyTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addActivity = (activity: Activity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(act => 
      act.id === id ? { ...act, ...updates, timestamp: Date.now() } : act
    ));
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem("prep-ia-activities");
  };

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  const resumeActivity = (id: string) => {
    return activities.find(a => a.id === id);
  };

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      points, 
      studyTime, 
      addActivity, 
      updateActivity, 
      clearActivities,
      addPoints,
      resumeActivity
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
