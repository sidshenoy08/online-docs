#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0949c0a4d9df51f80adc5b9bf4a508e56c381d85ba1905f28589f06379e71c24/contract';
import endContract from '../../snapshots/0949c0a4d9df51f80adc5b9bf4a508e56c381d85ba1905f28589f06379e71c24/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/3989063b95118b0df5a44e13832f93c8e9d182093ae4d1d71f078c3bc5b502c1/contract';
import startContract from '../../snapshots/3989063b95118b0df5a44e13832f93c8e9d182093ae4d1d71f078c3bc5b502c1/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Document',
        columns: [
          col('content', 'json', { notNull: true, codecRef: { codecId: 'pg/json@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Document',
        index: 'Document_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Document',
        foreignKey: {
          name: 'Document_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
