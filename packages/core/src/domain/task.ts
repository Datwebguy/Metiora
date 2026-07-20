export type TaskCategory = 
  | 'blueprint'
  | 'investor_ready'
  | 'grant_builder'
  | 'token_launch'
  | 'partnership_studio'
  | 'startup_health';

export type TaskStatus = 'received' | 'analyzing' | 'generating' | 'validating' | 'completed' | 'failed';

export interface TaskIntent {
  rawGoal: string;
  category: TaskCategory;
  detectedMode: 'founder' | 'fundraising' | 'grant' | 'launch' | 'growth' | 'strategy';
  missingParameters: string[];
}

export interface TaskDescriptor {
  taskId: string;
  founderId: string;
  startupId: string;
  intent: TaskIntent;
  status: TaskStatus;
  receivedAt: Date;
  completedAt?: Date;
}
