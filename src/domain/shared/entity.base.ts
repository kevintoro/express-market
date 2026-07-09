import { randomUUID } from 'crypto';

export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(props: T, id?: string) {
    this._id = id ?? randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = { id: this._id };
    for (const key of Object.keys(this.props as Record<string, unknown>)) {
      result[key] = (this.props as Record<string, unknown>)[key];
    }
    return result;
  }

  public equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) return false;
    if (this.constructor !== other.constructor) return false;
    return this._id === other._id;
  }
}
