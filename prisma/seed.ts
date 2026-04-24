import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean old data securely depending on what's there (better to just drop db on SQLite, but we'll try this)
  await prisma.approval.deleteMany();
  await prisma.sharedFundWithdrawalRequest.deleteMany();
  await prisma.sharedFundContribution.deleteMany();
  await prisma.sharedFundMember.deleteMany();
  await prisma.sharedFund.deleteMany();
  await prisma.zoneRule.deleteMany();
  await prisma.childAccount.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.flaggedRecipient.deleteMany();

  // 1. Create Users
  const usersToCreate = [
    { id: 'u_akmal', name: 'Akmal', role: 'PARENT', avatar: '/pfp/akmal.png' },
    { id: 'u_ibad', name: 'Ibad', role: 'GENERAL', avatar: '/pfp/ibad.png' },
    { id: 'u_paan', name: 'Paan', role: 'COMPANION', avatar: '/pfp/paan.png' },
    { id: 'u_wafi', name: 'Wafi', role: 'FRIEND', avatar: '/pfp/wafi.png' },
    { id: 'u_abang', name: 'Abangku', role: 'FRIEND', avatar: '/pfp/aizat.png' },
    { id: 'u_child', name: 'Child Demo', role: 'CHILD', avatar: '/pfp/child.png' },
  ];

  for (const u of usersToCreate) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        wallet: {
          create: {
            balance: u.role === 'CHILD' ? 120.50 : 2500.00
          }
        }
      }
    });
  }

  // 2. Set up Child Account under Akmal
  await prisma.childAccount.create({
    data: {
      parentId: 'u_akmal',
      childId: 'u_child',
      spendingLimit: 200.0,
      limitType: 'WEEKLY',
      zoneRules: {
        create: [
          { name: 'School Zone', isActive: true },
          { name: 'Home Area', isActive: true }
        ]
      }
    }
  });

  // 3. Set up a Shared Fund "Bali Trip"
  const fund = await prisma.sharedFund.create({
    data: {
      id: 'f_bali',
      name: 'Bali Trip 2026',
      description: 'Tabung untuk trip ke Bali hujung tahun',
      goalAmount: 5000.00,
      balance: 1500.00,
      approvalRule: '2_OF_3',
      ownerId: 'u_akmal',
      members: {
        create: [
          { userId: 'u_akmal', role: 'ADMIN' },
          { userId: 'u_paan', role: 'APPROVER' },
          { userId: 'u_wafi', role: 'MEMBER' },
        ]
      }
    }
  });

  // 4. Create some transactions for child history (to establish baseline)
  for (let i = 0; i < 5; i++) {
    await prisma.transaction.create({
      data: {
        amount: 8.50,
        note: 'Kantin Sekolah',
        status: 'COMPLETED',
        senderId: 'u_child',
        category: 'MERCHANT'
      }
    });
  }

  // 5. Flagged Recipients
  await prisma.flaggedRecipient.create({
    data: {
      accountId: 'SCAMMER_123',
      reason: 'Reported mule account via CCID'
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
