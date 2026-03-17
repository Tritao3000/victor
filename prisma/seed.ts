import { PrismaClient, ServiceType, ProviderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample service providers
  const plumber = await prisma.serviceProvider.upsert({
    where: { email: 'mike.plumber@victor.com' },
    update: {},
    create: {
      email: 'mike.plumber@victor.com',
      name: 'Mike Thompson',
      phone: '555-0101',
      bio: '15 years of plumbing experience. Licensed and insured. Fast, reliable service.',
      serviceTypes: [ServiceType.PLUMBING],
      specialties: ['leak repair', 'drain cleaning', 'pipe installation', 'water heater'],
      city: 'San Francisco',
      state: 'CA',
      serviceRadius: 30,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: 'PL-12345',
      insuranceExpiry: new Date('2027-12-31'),
      rating: 4.8,
      totalReviews: 127,
      isActive: true,
    },
  });

  const electrician = await prisma.serviceProvider.upsert({
    where: { email: 'sarah.electrician@victor.com' },
    update: {},
    create: {
      email: 'sarah.electrician@victor.com',
      name: 'Sarah Martinez',
      phone: '555-0102',
      bio: 'Master electrician with 20+ years experience. Residential and commercial work.',
      serviceTypes: [ServiceType.ELECTRICAL],
      specialties: ['outlet installation', 'circuit repair', 'panel upgrade', 'lighting'],
      city: 'San Francisco',
      state: 'CA',
      serviceRadius: 25,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: 'EL-67890',
      insuranceExpiry: new Date('2027-06-30'),
      rating: 4.9,
      totalReviews: 203,
      isActive: true,
    },
  });

  const multiService = await prisma.serviceProvider.upsert({
    where: { email: 'john.multiservice@victor.com' },
    update: {},
    create: {
      email: 'john.multiservice@victor.com',
      name: 'John Rivera',
      phone: '555-0103',
      bio: 'Licensed for both plumbing and electrical work. One-stop solution for your home.',
      serviceTypes: [ServiceType.PLUMBING, ServiceType.ELECTRICAL],
      specialties: ['general plumbing', 'general electrical', 'emergency repairs'],
      city: 'San Francisco',
      state: 'CA',
      serviceRadius: 20,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: 'PL-54321 / EL-09876',
      insuranceExpiry: new Date('2027-09-30'),
      rating: 4.7,
      totalReviews: 89,
      isActive: true,
    },
  });

  console.log('✅ Created service providers:', {
    plumber: plumber.id,
    electrician: electrician.id,
    multiService: multiService.id,
  });

  // Create service offerings for plumber
  const plumbingServices = [
    {
      name: 'Emergency Leak Repair',
      description: 'Fast response to leaks and burst pipes. Available 24/7.',
      category: 'Leak Repair',
      basePrice: 150,
      estimatedDuration: 120,
    },
    {
      name: 'Drain Cleaning',
      description: 'Professional drain and sewer line cleaning.',
      category: 'Drain Services',
      basePrice: 120,
      estimatedDuration: 90,
    },
    {
      name: 'Water Heater Installation',
      description: 'Complete water heater installation and replacement.',
      category: 'Installation',
      basePrice: 800,
      priceUnit: 'per job',
      estimatedDuration: 240,
    },
    {
      name: 'Pipe Installation & Repair',
      description: 'New pipe installation and repair of existing plumbing.',
      category: 'Pipe Services',
      basePrice: 200,
      estimatedDuration: 180,
    },
  ];

  for (const service of plumbingServices) {
    await prisma.service.create({
      data: {
        ...service,
        serviceType: ServiceType.PLUMBING,
        providerId: plumber.id,
      },
    });
  }

  // Create service offerings for electrician
  const electricalServices = [
    {
      name: 'Outlet Installation',
      description: 'Install new electrical outlets and switches.',
      category: 'Installation',
      basePrice: 85,
      estimatedDuration: 60,
    },
    {
      name: 'Circuit Breaker Repair',
      description: 'Diagnose and repair electrical panel issues.',
      category: 'Repair',
      basePrice: 150,
      estimatedDuration: 90,
    },
    {
      name: 'Lighting Installation',
      description: 'Install ceiling fans, chandeliers, and recessed lighting.',
      category: 'Lighting',
      basePrice: 120,
      estimatedDuration: 120,
    },
    {
      name: 'Panel Upgrade',
      description: 'Upgrade electrical panel to handle modern loads.',
      category: 'Upgrade',
      basePrice: 1200,
      priceUnit: 'per job',
      estimatedDuration: 360,
    },
  ];

  for (const service of electricalServices) {
    await prisma.service.create({
      data: {
        ...service,
        serviceType: ServiceType.ELECTRICAL,
        providerId: electrician.id,
      },
    });
  }

  // Add some services for multi-service provider
  await prisma.service.create({
    data: {
      name: 'Emergency Home Repair',
      description: 'Quick response for urgent plumbing or electrical issues.',
      serviceType: ServiceType.PLUMBING,
      category: 'Emergency',
      basePrice: 200,
      estimatedDuration: 90,
      providerId: multiService.id,
    },
  });

  console.log('✅ Created service offerings');

  // Create a sample customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Customer',
      phone: '555-1234',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created sample customer:', customer.id);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
