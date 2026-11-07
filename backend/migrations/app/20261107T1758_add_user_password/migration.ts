#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3989063b95118b0df5a44e13832f93c8e9d182093ae4d1d71f078c3bc5b502c1/contract';
import endContract from '../../snapshots/3989063b95118b0df5a44e13832f93c8e9d182093ae4d1d71f078c3bc5b502c1/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/a62d15a094e80be7b342d75e0538935972b9699c76dabb5339940dd50d17a889/contract';
import startContract from '../../snapshots/a62d15a094e80be7b342d75e0538935972b9699c76dabb5339940dd50d17a889/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'User',
        column: 'password',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
