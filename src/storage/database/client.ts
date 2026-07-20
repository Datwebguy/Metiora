import { PrismaClient } from '@prisma/client';

export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getPrisma(): PrismaClient;
}

export class DatabaseService implements IDatabaseClient {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  getPrisma(): PrismaClient {
    return this.prisma;
  }
}
