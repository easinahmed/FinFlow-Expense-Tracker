import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Food & Dining', icon: 'utensils', color: '#f59e0b', type: 'EXPENSE' },
  { name: 'Transport', icon: 'car', color: '#3b82f6', type: 'EXPENSE' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#ec4899', type: 'EXPENSE' },
  { name: 'Bills & Utilities', icon: 'zap', color: '#8b5cf6', type: 'EXPENSE' },
  { name: 'Education', icon: 'book-open', color: '#06b6d4', type: 'EXPENSE' },
  { name: 'Health', icon: 'heart', color: '#ef4444', type: 'EXPENSE' },
  { name: 'Entertainment', icon: 'film', color: '#10b981', type: 'EXPENSE' },
  { name: 'Travel', icon: 'plane', color: '#f97316', type: 'EXPENSE' },
  { name: 'Others', icon: 'more-horizontal', color: '#6b7280', type: 'BOTH' },
  { name: 'Salary', icon: 'briefcase', color: '#22c55e', type: 'INCOME' },
  { name: 'Freelance', icon: 'laptop', color: '#14b8a6', type: 'INCOME' },
  { name: 'Investment', icon: 'trending-up', color: '#6366f1', type: 'INCOME' },
  { name: 'Gift', icon: 'gift', color: '#f43f5e', type: 'INCOME' },
  { name: 'Business', icon: 'store', color: '#84cc16', type: 'INCOME' },
];

async function main() {
  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { id: `default-${cat.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `default-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type as any,
        isDefault: true,
        userId: null,
      },
    });
  }
  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
