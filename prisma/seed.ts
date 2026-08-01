import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (existingAdmin) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@E86800';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@crestlinecapital.com';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      firstName: 'Crestline',
      lastName: 'Admin',
      phone: '+1-555-000-0000',
      role: 'admin',
      status: 'active',
      kycStatus: 'verified',
    },
  });

  const adminAccount = await prisma.account.create({
    data: {
      userId: admin.id,
      accountNumber: '1000000001',
      accountType: 'checking',
      balance: 5000000,
      currency: 'USD',
      status: 'active',
    },
  });

  const testPasswordHash = await bcrypt.hash('User@123!', 12);
  const user = await prisma.user.create({
    data: {
      email: 'emmanuel@crestlinecapital.com',
      passwordHash: testPasswordHash,
      firstName: 'Emmanuel',
      lastName: 'Owighoyota',
      phone: '+234-800-000-0000',
      role: 'user',
      status: 'active',
      kycStatus: 'verified',
    },
  });

  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      accountNumber: '2000000001',
      accountType: 'checking',
      balance: 25000,
      currency: 'USD',
      status: 'active',
    },
  });

  const savings = await prisma.account.create({
    data: {
      userId: user.id,
      accountNumber: '2000000002',
      accountType: 'savings',
      balance: 75000,
      currency: 'USD',
      status: 'active',
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        fromAccountId: null,
        toAccountId: checking.id,
        type: 'deposit',
        amount: 10000,
        description: 'Initial deposit',
        reference: 'CRT-INIT-001',
        status: 'completed',
      },
      {
        fromAccountId: null,
        toAccountId: checking.id,
        type: 'deposit',
        amount: 15000,
        description: 'Salary deposit',
        reference: 'CRT-SAL-001',
        status: 'completed',
      },
      {
        fromAccountId: checking.id,
        toAccountId: savings.id,
        type: 'transfer',
        amount: 5000,
        description: 'Monthly savings transfer',
        reference: 'CRT-TRF-001',
        status: 'completed',
      },
      {
        fromAccountId: checking.id,
        toAccountId: null,
        type: 'withdrawal',
        amount: 2500,
        description: 'ATM withdrawal',
        reference: 'CRT-ATM-001',
        status: 'completed',
      },
    ],
  });

  await prisma.card.create({
    data: {
      userId: user.id,
      cardNumber: '4532123456789012',
      lastFour: '9012',
      cardType: 'virtual',
      cardBrand: 'visa',
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '123',
      pinHash: await bcrypt.hash('1234', 12),
      status: 'active',
      dailyLimit: 5000,
    },
  });

  await prisma.card.create({
    data: {
      userId: user.id,
      cardNumber: '5412751234567890',
      lastFour: '7890',
      cardType: 'physical',
      cardBrand: 'mastercard',
      expiryMonth: '08',
      expiryYear: '2027',
      cvv: '456',
      pinHash: await bcrypt.hash('5678', 12),
      status: 'active',
      dailyLimit: 10000,
    },
  });

  await prisma.investmentPortfolio.create({
    data: {
      userId: user.id,
      name: 'Growth Portfolio',
      totalInvested: 50000,
      currentValue: 58750,
      returns: 17.5,
      assetAllocation: JSON.stringify({ stocks: 60, bonds: 25, crypto: 10, cash: 5 }),
      autoDeposit: true,
      autoDepositAmt: 1000,
      status: 'active',
    },
  });

  await prisma.systemMetric.createMany({
    data: [
      { metric: 'total_deposits', value: 500000000 },
      { metric: 'active_users', value: 10000 },
      { metric: 'total_transactions', value: 150000 },
      { metric: 'daily_volume', value: 2500000 },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`User: emmanuel@crestlinecapital.com / User@123!`);
}

seedDatabase().then(() => { console.log('Done'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
