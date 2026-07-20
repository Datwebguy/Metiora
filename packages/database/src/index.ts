// Database package entry point
export interface DatabaseConnectionConfig {
  connectionString: string;
  maxConnections?: number;
}

export const DATABASE_PACKAGE_VERSION = '1.0.0';
