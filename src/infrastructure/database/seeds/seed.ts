import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { CategoryService } from '../../../application/category/services/category.service';
import { ProductService } from '../../../application/product/services/product.service';
import { InventoryService } from '../../../application/product/services/inventory.service';
import { DuplicateCategoryException } from '../../../domain/category/exceptions/duplicate-category.exception';
import { DuplicateSkuException } from '../../../domain/product/exceptions/duplicate-sku.exception';

const categoriesSeed = [
  { name: 'Bebidas', description: 'Bebidas y refrescos' },
  { name: 'Lácteos', description: 'Productos lácteos' },
  { name: 'Snacks', description: 'Snacks y pasabocas' },
  { name: 'Limpieza', description: 'Productos de limpieza' },
];

const productsSeed = [
  {
    name: 'Agua Mineral 500ml',
    sku: 'BEB-001',
    categoryName: 'Bebidas',
    price: 1500,
    stock: 150,
    minStock: 50,
    supplier: 'Distribuidora Andina',
  },
  {
    name: 'Jugo de Naranja 1L',
    sku: 'BEB-002',
    categoryName: 'Bebidas',
    price: 3200,
    stock: 30,
    minStock: 40,
    supplier: 'Lácteos del Valle',
  },
  {
    name: 'Leche Entera 1L',
    sku: 'LAC-001',
    categoryName: 'Lácteos',
    price: 2100,
    stock: 200,
    minStock: 60,
    supplier: 'Lácteos del Valle',
  },
  {
    name: 'Yogur Natural 500g',
    sku: 'LAC-002',
    categoryName: 'Lácteos',
    price: 2800,
    stock: 15,
    minStock: 25,
    supplier: 'Lácteos del Valle',
  },
  {
    name: 'Papas Fritas 200g',
    sku: 'SNA-001',
    categoryName: 'Snacks',
    price: 2500,
    stock: 80,
    minStock: 30,
    supplier: 'Snacks Corp',
  },
  {
    name: 'Detergente 1L',
    sku: 'LIM-001',
    categoryName: 'Limpieza',
    price: 4500,
    stock: 45,
    minStock: 20,
    supplier: 'Químicos del Sur',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const categoryService = app.get(CategoryService);
  const productService = app.get(ProductService);
  const inventoryService = app.get(InventoryService);

  try {
    console.log('Seeding categories...');
    const categoryMap = new Map<string, string>();
    const allCategories = await categoryService.findAll();
    for (const category of allCategories) {
      categoryMap.set(category.name, category.id);
    }

    for (const { name, description } of categoriesSeed) {
      if (categoryMap.has(name)) {
        console.log(`Category "${name}" already exists, skipping.`);
        continue;
      }
      try {
        const category = await categoryService.create(name, description);
        categoryMap.set(category.name, category.id);
        console.log(`Created category "${category.name}" (${category.id}).`);
      } catch (error) {
        if (error instanceof DuplicateCategoryException) {
          console.log(`Category "${name}" already exists, skipping.`);
          continue;
        }
        throw error;
      }
    }

    console.log('Seeding products...');
    for (const productSeed of productsSeed) {
      const categoryId = categoryMap.get(productSeed.categoryName);
      if (!categoryId) {
        console.warn(
          `Category "${productSeed.categoryName}" not found, skipping product "${productSeed.name}".`,
        );
        continue;
      }

      try {
        const product = await productService.register(
          productSeed.name,
          productSeed.sku,
          categoryId,
          productSeed.price,
          productSeed.minStock,
          productSeed.supplier,
        );
        console.log(
          `Created product "${product.name}" with SKU ${product.sku.value} (${product.id}).`,
        );

        if (productSeed.stock > 0) {
          await inventoryService.adjustStock(
            product.id,
            productSeed.stock,
            'Stock inicial (seed)',
          );
          console.log(
            `Adjusted stock for "${product.name}" to ${productSeed.stock}.`,
          );
        }
      } catch (error) {
        if (error instanceof DuplicateSkuException) {
          console.log(
            `Product with SKU "${productSeed.sku}" already exists, skipping.`,
          );
          continue;
        }
        throw error;
      }
    }

    console.log('Seed completed successfully.');
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
