import { Entity } from '../../shared/entity.base';

interface CategoryProps {
  name: string;
  description?: string;
  isActive: boolean;
}

export class Category extends Entity<CategoryProps> {
  constructor(props: CategoryProps, id?: string) {
    super(props, id);
  }

  static create(name: string, description?: string): Category {
    return new Category({ name, description, isActive: true });
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  activate(): void {
    this.props.isActive = true;
  }
}
