import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;
  const tableNames = entities.map((e) => `"${e.tableName}"`).join(', ');
  await dataSource.query(`TRUNCATE TABLE ${tableNames} CASCADE`);
}
