import { ConflictException } from '@nestjs/common';

interface Entity<IdType> {
  id: IdType;
}

export abstract class Repo<IdType, EntityType extends Entity<IdType>> {
  protected readonly items: EntityType[] = [];

  add(item: EntityType): void {
    if (this.items.find((el) => el.id === item.id)) {
      throw new ConflictException('id already in use');
    }
    this.items.push(item);
  }

  find(id: IdType): EntityType | undefined {
    return this.items.find((el) => el.id === id);
  }

  findAll(): EntityType[] {
    return this.items;
  }

  update(id: IdType, newItem: EntityType): void {
    const idx = this.items.findIndex((el) => el.id === id);
    if (idx === -1) {
      throw new Error('id not found');
    }
    this.items.splice(idx, 1, newItem);
  }
}
