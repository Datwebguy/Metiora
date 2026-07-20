export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExecutionEnvironment = 'development' | 'staging' | 'production' | 'test';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
