import { BaseEntity } from '@metiora/shared';

export abstract class AggregateRoot implements BaseEntity {
  abstract readonly id: string;
  abstract readonly createdAt: Date;
  abstract readonly updatedAt: Date;
}
