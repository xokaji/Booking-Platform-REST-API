import { PrismaClient, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'admin@en2h.com' },
    update: {},
    create: {
      email: 'admin@en2h.com',
      password: passwordHash,
      name: 'Platform Admin',
    },
  });

  const haircut = await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Classic Haircut',
      description: 'A precision haircut tailored to your style.',
      duration: 30,
      price: 25.0,
      isActive: true,
      ownerId: owner.id,
    },
  });

  const massage = await prisma.service.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Relaxation Massage',
      description: 'A 60-minute full body relaxation massage.',
      duration: 60,
      price: 60.0,
      isActive: true,
      ownerId: owner.id,
    },
  });

  await prisma.booking.upsert({
    where: {
      uniqueServiceSlot: {
        serviceId: haircut.id,
        bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        bookingTime: '10:00',
      },
    },
    update: {},
    create: {
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      customerPhone: '+94770000000',
      serviceId: haircut.id,
      bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      bookingTime: '10:00',
      status: BookingStatus.PENDING,
      notes: 'First time customer.',
    },
  });

  console.log('Seed data created:', { owner: owner.email, services: [haircut.title, massage.title] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
