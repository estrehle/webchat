import { Injectable } from '@nestjs/common';
import { ConfirmedConnection, Connection } from '@src/types/connection';
import { Repo } from './repo.base';

Injectable();
export class ConnectionRepo extends Repo<string, Connection> {
  findAllConfirmed(): ConfirmedConnection[] {
    return this.items.filter(
      (c): c is ConfirmedConnection => c.status === 'confirmed',
    );
  }
}
