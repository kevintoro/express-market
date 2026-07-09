export class DuplicateCategoryException extends Error {
  constructor(name: string) {
    super(`Category "${name}" already exists`);
    this.name = 'DuplicateCategoryException';
  }
}
