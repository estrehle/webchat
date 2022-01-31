import { Repo } from './repo.base';

interface TestEntity {
  id: number;
  value: string;
}

class TestRepo extends Repo<number, TestEntity> {}

describe('Repo', () => {
  let testRepo: TestRepo;

  beforeEach(() => {
    testRepo = new TestRepo();
  });

  it('should be empty on initialization', async () => {
    const res = testRepo.findAll();

    expect(res).toEqual([]);
  });

  it('should find added item', async () => {
    const id = 0;
    const item: TestEntity = { id, value: 'test' };

    testRepo.add(item);
    const res = testRepo.find(id);

    expect(res).toEqual(item);
  });

  it('should find all added items', async () => {
    const id0 = 0;
    const id1 = 1;
    const item0: TestEntity = { id: id0, value: 'test' };
    const item1: TestEntity = { id: id1, value: 'test' };

    testRepo.add(item0);
    testRepo.add(item1);
    const res = testRepo.findAll();

    expect(res.length).toEqual(2);
    expect(res).toContain(item0);
    expect(res).toContain(item1);
  });

  it('should update item', async () => {
    const id = 0;
    const oldValue = 'old';
    const oldItem: TestEntity = { id, value: oldValue };

    testRepo.add(oldItem);
    const oldRes = testRepo.find(id);

    expect(oldRes?.value).toEqual(oldValue);

    const newValue = 'new';
    const newItem: TestEntity = { id, value: newValue };
    testRepo.update(id, newItem);
    const newRes = testRepo.find(id);

    expect(newRes?.value).toEqual(newValue);
  });
});
