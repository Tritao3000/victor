import {
  PrismaClient,
  ServiceType,
  ProviderStatus,
  BookingStatus,
  BookingUrgency,
  PaymentStatus,
} from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

// Helper to create a user via Better Auth (handles password hashing + account creation)
async function createAuthUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      headers: new Headers({ "x-seed-script": "true" }),
    });
    return result.user;
  } catch (e: unknown) {
    // User may already exist if seed is re-run
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists") || msg.includes("UNIQUE")) {
      console.log(`  User ${data.email} already exists, skipping auth creation`);
      return prisma.user.findUnique({ where: { email: data.email } });
    }
    throw e;
  }
}

async function main() {
  console.log("Seeding database with Portuguese demo data...\n");

  // ---------------------------------------------------------------------------
  // 1. Clean existing demo data (idempotent: safe to re-run)
  // ---------------------------------------------------------------------------
  console.log("Cleaning existing demo data...");

  const demoEmails = [
    "maria.silva@demo.victor.pt",
    "joao.santos@demo.victor.pt",
    "ana.costa@demo.victor.pt",
    "beatriz.pereira@demo.victor.pt",
    "carlos.oliveira@demo.victor.pt",
    "pedro.ferreira@demo.victor.pt",
    "rui.almeida@demo.victor.pt",
    "sofia.martins@demo.victor.pt",
  ];

  const demoProviderEmails = [
    "carlos.oliveira@demo.victor.pt",
    "pedro.ferreira@demo.victor.pt",
    "rui.almeida@demo.victor.pt",
    "sofia.martins@demo.victor.pt",
  ];

  // Delete in order: reviews -> payments -> bookings -> services -> accounts/sessions -> users -> providers
  await prisma.review.deleteMany({
    where: { customer: { email: { in: demoEmails } } },
  });
  await prisma.payment.deleteMany({
    where: { booking: { customer: { email: { in: demoEmails } } } },
  });
  await prisma.booking.deleteMany({
    where: { customer: { email: { in: demoEmails } } },
  });
  await prisma.service.deleteMany({
    where: { provider: { email: { in: demoProviderEmails } } },
  });
  await prisma.account.deleteMany({
    where: { user: { email: { in: demoEmails } } },
  });
  await prisma.session.deleteMany({
    where: { user: { email: { in: demoEmails } } },
  });

  // Unlink users from providers before deleting
  await prisma.user.updateMany({
    where: { email: { in: demoEmails } },
    data: { serviceProviderId: null },
  });
  await prisma.user.deleteMany({
    where: { email: { in: demoEmails } },
  });
  await prisma.serviceProvider.deleteMany({
    where: { email: { in: demoProviderEmails } },
  });

  console.log("  Done.\n");

  // ---------------------------------------------------------------------------
  // 2. Create demo customers (Portuguese names, Lisbon-area)
  // ---------------------------------------------------------------------------
  console.log("Creating demo customers...");

  const maria = await createAuthUser({
    name: "Maria Silva",
    email: "maria.silva@demo.victor.pt",
    password: "demo123",
  });
  if (maria) {
    await prisma.user.update({
      where: { id: maria.id },
      data: {
        phone: "+351 912 345 678",
        address: "Rua Augusta 42, 3o Esq",
        city: "Lisboa",
        state: "Lisboa",
        zipCode: "1100-053",
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  }

  const joao = await createAuthUser({
    name: "Joao Santos",
    email: "joao.santos@demo.victor.pt",
    password: "demo123",
  });
  if (joao) {
    await prisma.user.update({
      where: { id: joao.id },
      data: {
        phone: "+351 913 456 789",
        address: "Avenida da Liberdade 120, 5o Dto",
        city: "Lisboa",
        state: "Lisboa",
        zipCode: "1250-146",
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  }

  const ana = await createAuthUser({
    name: "Ana Costa",
    email: "ana.costa@demo.victor.pt",
    password: "demo123",
  });
  if (ana) {
    await prisma.user.update({
      where: { id: ana.id },
      data: {
        phone: "+351 914 567 890",
        address: "Rua de Santa Catarina 15, 2o",
        city: "Cascais",
        state: "Lisboa",
        zipCode: "2750-340",
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  }

  const beatriz = await createAuthUser({
    name: "Beatriz Pereira",
    email: "beatriz.pereira@demo.victor.pt",
    password: "demo123",
  });
  if (beatriz) {
    await prisma.user.update({
      where: { id: beatriz.id },
      data: {
        phone: "+351 915 678 901",
        address: "Praca do Comercio 8, 1o",
        city: "Sintra",
        state: "Lisboa",
        zipCode: "2710-405",
        emailVerified: new Date(),
        role: "CUSTOMER",
      },
    });
  }

  console.log("  Created: Maria Silva, Joao Santos, Ana Costa, Beatriz Pereira\n");

  // ---------------------------------------------------------------------------
  // 3. Create demo service providers
  // ---------------------------------------------------------------------------
  console.log("Creating demo service providers...");

  const carlosProvider = await prisma.serviceProvider.create({
    data: {
      email: "carlos.oliveira@demo.victor.pt",
      name: "Carlos Oliveira",
      phone: "+351 916 789 012",
      bio: "Canalizador com 15 anos de experiencia na area de Lisboa. Especialista em reparacao de fugas e instalacao de canalizacoes.",
      serviceTypes: [ServiceType.PLUMBING],
      specialties: ["reparacao de fugas", "desentupimentos", "instalacao de canalizacao", "esquentadores"],
      city: "Lisboa",
      state: "Lisboa",
      serviceRadius: 30,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: "CAN-2024-1234",
      insuranceExpiry: new Date("2027-12-31"),
      stripeOnboardingComplete: true,
      rating: 4.8,
      totalReviews: 127,
      isActive: true,
    },
  });

  const pedroProvider = await prisma.serviceProvider.create({
    data: {
      email: "pedro.ferreira@demo.victor.pt",
      name: "Pedro Ferreira",
      phone: "+351 917 890 123",
      bio: "Electricista certificado, especializado em instalacoes residenciais e reparacoes de emergencia. Trabalho em todo o Grande Porto.",
      serviceTypes: [ServiceType.ELECTRICAL],
      specialties: ["instalacao de tomadas", "quadros eletricos", "iluminacao", "certificacao eletrica"],
      city: "Porto",
      state: "Porto",
      serviceRadius: 25,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: "ELE-2024-5678",
      insuranceExpiry: new Date("2027-06-30"),
      stripeOnboardingComplete: true,
      rating: 4.9,
      totalReviews: 89,
      isActive: true,
    },
  });

  const ruiProvider = await prisma.serviceProvider.create({
    data: {
      email: "rui.almeida@demo.victor.pt",
      name: "Rui Almeida",
      phone: "+351 918 901 234",
      bio: "Profissional polivalente com dupla certificacao em canalizacao e eletricidade. Servico rapido e fiavel na zona de Lisboa.",
      serviceTypes: [ServiceType.PLUMBING, ServiceType.ELECTRICAL],
      specialties: ["canalizacao geral", "eletricidade geral", "reparacoes de emergencia"],
      city: "Amadora",
      state: "Lisboa",
      serviceRadius: 20,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: "CAN-2023-9012 / ELE-2023-3456",
      insuranceExpiry: new Date("2027-09-30"),
      stripeOnboardingComplete: true,
      rating: 4.7,
      totalReviews: 64,
      isActive: true,
    },
  });

  const sofiaProvider = await prisma.serviceProvider.create({
    data: {
      email: "sofia.martins@demo.victor.pt",
      name: "Sofia Martins",
      phone: "+351 919 012 345",
      bio: "Electricista com especializacao em automacao residencial e instalacao de paineis solares. Zona de Cascais e Sintra.",
      serviceTypes: [ServiceType.ELECTRICAL],
      specialties: ["automacao residencial", "paineis solares", "iluminacao LED", "carregadores de veiculos eletricos"],
      city: "Cascais",
      state: "Lisboa",
      serviceRadius: 15,
      verificationStatus: ProviderStatus.VERIFIED,
      verifiedAt: new Date(),
      licenseNumber: "ELE-2024-7890",
      insuranceExpiry: new Date("2028-03-31"),
      stripeOnboardingComplete: true,
      rating: 4.9,
      totalReviews: 42,
      isActive: true,
    },
  });

  console.log("  Created: Carlos Oliveira, Pedro Ferreira, Rui Almeida, Sofia Martins\n");

  // Create auth users for providers and link them
  console.log("Creating auth accounts for providers...");

  const carlosUser = await createAuthUser({
    name: "Carlos Oliveira",
    email: "carlos.oliveira@demo.victor.pt",
    password: "demo123",
  });
  if (carlosUser) {
    await prisma.user.update({
      where: { id: carlosUser.id },
      data: {
        role: "SERVICE_PROVIDER",
        serviceProviderId: carlosProvider.id,
        phone: "+351 916 789 012",
        city: "Lisboa",
        state: "Lisboa",
        emailVerified: new Date(),
      },
    });
  }

  const pedroUser = await createAuthUser({
    name: "Pedro Ferreira",
    email: "pedro.ferreira@demo.victor.pt",
    password: "demo123",
  });
  if (pedroUser) {
    await prisma.user.update({
      where: { id: pedroUser.id },
      data: {
        role: "SERVICE_PROVIDER",
        serviceProviderId: pedroProvider.id,
        phone: "+351 917 890 123",
        city: "Porto",
        state: "Porto",
        emailVerified: new Date(),
      },
    });
  }

  const ruiUser = await createAuthUser({
    name: "Rui Almeida",
    email: "rui.almeida@demo.victor.pt",
    password: "demo123",
  });
  if (ruiUser) {
    await prisma.user.update({
      where: { id: ruiUser.id },
      data: {
        role: "SERVICE_PROVIDER",
        serviceProviderId: ruiProvider.id,
        phone: "+351 918 901 234",
        city: "Amadora",
        state: "Lisboa",
        emailVerified: new Date(),
      },
    });
  }

  const sofiaUser = await createAuthUser({
    name: "Sofia Martins",
    email: "sofia.martins@demo.victor.pt",
    password: "demo123",
  });
  if (sofiaUser) {
    await prisma.user.update({
      where: { id: sofiaUser.id },
      data: {
        role: "SERVICE_PROVIDER",
        serviceProviderId: sofiaProvider.id,
        phone: "+351 919 012 345",
        city: "Cascais",
        state: "Lisboa",
        emailVerified: new Date(),
      },
    });
  }

  console.log("  Done.\n");

  // ---------------------------------------------------------------------------
  // 4. Create provider services
  // ---------------------------------------------------------------------------
  console.log("Creating provider service offerings...");

  // Carlos (plumber) services
  const carlosServices = [
    {
      name: "Reparacao de Fugas",
      description: "Reparacao urgente de fugas em tubagens e torneiras. Disponivel 24/7.",
      category: "Leak Repair",
      basePrice: 80,
      estimatedDuration: 90,
    },
    {
      name: "Desentupimento",
      description: "Desentupimento profissional de esgotos e canalizacoes.",
      category: "Drain Services",
      basePrice: 65,
      estimatedDuration: 60,
    },
    {
      name: "Instalacao de Esquentador",
      description: "Instalacao e substituicao de esquentadores e termoacumuladores.",
      category: "Installation",
      basePrice: 150,
      estimatedDuration: 180,
    },
  ];

  for (const svc of carlosServices) {
    await prisma.service.create({
      data: { ...svc, serviceType: ServiceType.PLUMBING, providerId: carlosProvider.id },
    });
  }

  // Pedro (electrician) services
  const pedroServices = [
    {
      name: "Instalacao de Tomadas",
      description: "Instalacao de tomadas e interruptores novos.",
      category: "Installation",
      basePrice: 55,
      estimatedDuration: 45,
    },
    {
      name: "Reparacao de Quadro Eletrico",
      description: "Diagnostico e reparacao de problemas no quadro eletrico.",
      category: "Repair",
      basePrice: 95,
      estimatedDuration: 90,
    },
    {
      name: "Instalacao de Iluminacao",
      description: "Instalacao de candeeiros, ventoinhas de teto e iluminacao embutida.",
      category: "Lighting",
      basePrice: 75,
      estimatedDuration: 90,
    },
  ];

  for (const svc of pedroServices) {
    await prisma.service.create({
      data: { ...svc, serviceType: ServiceType.ELECTRICAL, providerId: pedroProvider.id },
    });
  }

  // Sofia (electrician) services
  const sofiaServices = [
    {
      name: "Automacao Residencial",
      description: "Instalacao de interruptores inteligentes, termostatos e automacao residencial.",
      category: "Smart Home",
      basePrice: 100,
      estimatedDuration: 120,
    },
    {
      name: "Instalacao de Carregador EV",
      description: "Instalacao de carregadores para veiculos eletricos em garagem residencial.",
      category: "Installation",
      basePrice: 200,
      estimatedDuration: 240,
    },
  ];

  for (const svc of sofiaServices) {
    await prisma.service.create({
      data: { ...svc, serviceType: ServiceType.ELECTRICAL, providerId: sofiaProvider.id },
    });
  }

  // Rui (multi-service) services
  await prisma.service.create({
    data: {
      name: "Reparacao de Emergencia",
      description: "Resposta rapida para problemas urgentes de canalizacao ou eletricidade.",
      serviceType: ServiceType.PLUMBING,
      category: "Emergency",
      basePrice: 120,
      estimatedDuration: 90,
      providerId: ruiProvider.id,
    },
  });

  console.log("  Done.\n");

  // ---------------------------------------------------------------------------
  // 5. Seed platform-level service categories
  // ---------------------------------------------------------------------------
  console.log("Creating service categories...");

  const plumbingCategories = [
    { name: "Leak Repair", description: "Reparacao de fugas em tubagens e torneiras", basePrice: 80, estimatedDuration: 90 },
    { name: "Drain Cleaning", description: "Desentupimento de esgotos e canalizacoes", basePrice: 65, estimatedDuration: 60 },
    { name: "Water Heater", description: "Instalacao e reparacao de esquentadores e termoacumuladores", basePrice: 150, estimatedDuration: 180 },
    { name: "Pipe Installation", description: "Instalacao e substituicao de tubagens", basePrice: 120, estimatedDuration: 150 },
    { name: "Toilet Repair", description: "Reparacao de autoclismos e sanitas", basePrice: 60, estimatedDuration: 60 },
    { name: "Faucet Installation", description: "Instalacao e substituicao de torneiras", basePrice: 50, estimatedDuration: 45 },
    { name: "Emergency Plumbing", description: "Canalizacao de emergencia com resposta imediata", basePrice: 120, estimatedDuration: 120 },
  ];

  const electricalCategories = [
    { name: "Outlet Installation", description: "Instalacao de tomadas e interruptores", basePrice: 55, estimatedDuration: 45 },
    { name: "Circuit Breaker", description: "Reparacao e substituicao de disjuntores", basePrice: 95, estimatedDuration: 90 },
    { name: "Lighting Installation", description: "Instalacao de candeeiros, ventoinhas e iluminacao", basePrice: 75, estimatedDuration: 90 },
    { name: "Panel Upgrade", description: "Atualizacao do quadro eletrico", basePrice: 500, estimatedDuration: 300 },
    { name: "Wiring Repair", description: "Diagnostico e reparacao de cablagem defeituosa", basePrice: 95, estimatedDuration: 120 },
    { name: "Smart Home", description: "Instalacao de automacao residencial e dispositivos inteligentes", basePrice: 100, estimatedDuration: 60 },
    { name: "Emergency Electrical", description: "Eletricidade de emergencia com resposta imediata", basePrice: 120, estimatedDuration: 120 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of plumbingCategories) {
    const created = await prisma.serviceCategory.upsert({
      where: { serviceType_name: { serviceType: ServiceType.PLUMBING, name: cat.name } },
      update: { description: cat.description, basePrice: cat.basePrice, estimatedDuration: cat.estimatedDuration },
      create: { ...cat, serviceType: ServiceType.PLUMBING },
    });
    categoryMap[`PLUMBING:${cat.name}`] = created.id;
  }

  for (const cat of electricalCategories) {
    const created = await prisma.serviceCategory.upsert({
      where: { serviceType_name: { serviceType: ServiceType.ELECTRICAL, name: cat.name } },
      update: { description: cat.description, basePrice: cat.basePrice, estimatedDuration: cat.estimatedDuration },
      create: { ...cat, serviceType: ServiceType.ELECTRICAL },
    });
    categoryMap[`ELECTRICAL:${cat.name}`] = created.id;
  }

  console.log("  Done.\n");

  // ---------------------------------------------------------------------------
  // 6. Create demo bookings in various states
  // ---------------------------------------------------------------------------
  console.log("Creating demo bookings...");

  if (!maria || !joao || !ana || !beatriz) {
    throw new Error("Failed to create demo customers - cannot create bookings");
  }

  // Booking 1: COMPLETED - Maria's leaking faucet (with review)
  const booking1 = await prisma.booking.create({
    data: {
      customerId: maria.id,
      providerId: carlosProvider.id,
      serviceType: ServiceType.PLUMBING,
      serviceCategoryId: categoryMap["PLUMBING:Leak Repair"],
      urgency: BookingUrgency.TODAY,
      status: BookingStatus.COMPLETED,
      scheduledFor: new Date("2026-03-10T10:00:00Z"),
      completedAt: new Date("2026-03-10T11:30:00Z"),
      address: "Rua Augusta 42, 3o Esq",
      city: "Lisboa",
      state: "Lisboa",
      zipCode: "1100-053",
      locationNotes: "Codigo do portao: 4321",
      estimatedPrice: 80,
      quotedPrice: 80,
      finalPrice: 95,
      problemDescription: "Torneira da cozinha a pingar constantemente. Ja tentei apertar mas continua.",
      notes: "Vedante da torneira gasto. Substituido por vedante novo. Tambem apertei a ligacao sob o lava-louca.",
      matchedAt: new Date("2026-03-10T09:15:00Z"),
      providerAcceptedAt: new Date("2026-03-10T09:17:00Z"),
      estimatedArrival: new Date("2026-03-10T09:45:00Z"),
      matchAttempts: 1,
    },
  });

  // Booking 2: COMPLETED - Joao's outlet installation (with review)
  const booking2 = await prisma.booking.create({
    data: {
      customerId: joao.id,
      providerId: pedroProvider.id,
      serviceType: ServiceType.ELECTRICAL,
      serviceCategoryId: categoryMap["ELECTRICAL:Outlet Installation"],
      urgency: BookingUrgency.SCHEDULED,
      status: BookingStatus.COMPLETED,
      scheduledFor: new Date("2026-03-08T14:00:00Z"),
      completedAt: new Date("2026-03-08T15:00:00Z"),
      address: "Avenida da Liberdade 120, 5o Dto",
      city: "Lisboa",
      state: "Lisboa",
      zipCode: "1250-146",
      estimatedPrice: 55,
      quotedPrice: 55,
      finalPrice: 55,
      problemDescription: "Preciso de instalar 2 tomadas novas no escritorio para o computador e monitor.",
      notes: "Instalacao concluida sem problemas. Cablagem em bom estado.",
      matchedAt: new Date("2026-03-07T18:00:00Z"),
      providerAcceptedAt: new Date("2026-03-07T18:05:00Z"),
      estimatedArrival: new Date("2026-03-08T14:00:00Z"),
      matchAttempts: 1,
    },
  });

  // Booking 3: MATCHED - Ana's smart home installation (upcoming)
  await prisma.booking.create({
    data: {
      customerId: ana.id,
      providerId: sofiaProvider.id,
      serviceType: ServiceType.ELECTRICAL,
      serviceCategoryId: categoryMap["ELECTRICAL:Smart Home"],
      urgency: BookingUrgency.SCHEDULED,
      status: BookingStatus.MATCHED,
      scheduledFor: new Date("2026-03-20T10:00:00Z"),
      address: "Rua de Santa Catarina 15, 2o",
      city: "Cascais",
      state: "Lisboa",
      zipCode: "2750-340",
      locationNotes: "Tocar a campainha do 2o andar",
      estimatedPrice: 100,
      quotedPrice: 120,
      problemDescription: "Quero instalar interruptores inteligentes na sala e cozinha. Tenho os dispositivos Philips Hue.",
      matchedAt: new Date("2026-03-18T09:00:00Z"),
      providerAcceptedAt: new Date("2026-03-18T09:10:00Z"),
      estimatedArrival: new Date("2026-03-20T10:00:00Z"),
      matchAttempts: 1,
    },
  });

  // Booking 4: IN_PROGRESS - Beatriz's emergency plumbing
  await prisma.booking.create({
    data: {
      customerId: beatriz.id,
      providerId: ruiProvider.id,
      serviceType: ServiceType.PLUMBING,
      serviceCategoryId: categoryMap["PLUMBING:Emergency Plumbing"],
      urgency: BookingUrgency.EMERGENCY,
      status: BookingStatus.IN_PROGRESS,
      scheduledFor: new Date("2026-03-18T08:00:00Z"),
      address: "Praca do Comercio 8, 1o",
      city: "Sintra",
      state: "Lisboa",
      zipCode: "2710-405",
      estimatedPrice: 120,
      quotedPrice: 150,
      problemDescription: "Tubo rebentado debaixo do lava-louca da cozinha. Ha agua no chao!",
      matchedAt: new Date("2026-03-18T07:35:00Z"),
      providerAcceptedAt: new Date("2026-03-18T07:37:00Z"),
      estimatedArrival: new Date("2026-03-18T08:00:00Z"),
      matchAttempts: 1,
    },
  });

  // Booking 5: REQUESTED - Maria's lighting request (waiting for match)
  await prisma.booking.create({
    data: {
      customerId: maria.id,
      serviceType: ServiceType.ELECTRICAL,
      serviceCategoryId: categoryMap["ELECTRICAL:Lighting Installation"],
      urgency: BookingUrgency.SCHEDULED,
      status: BookingStatus.REQUESTED,
      scheduledFor: new Date("2026-03-22T15:00:00Z"),
      preferredTimeStart: new Date("2026-03-22T14:00:00Z"),
      preferredTimeEnd: new Date("2026-03-22T18:00:00Z"),
      address: "Rua Augusta 42, 3o Esq",
      city: "Lisboa",
      state: "Lisboa",
      zipCode: "1100-053",
      estimatedPrice: 75,
      problemDescription: "Quero instalar um candeeiro de teto novo na sala de jantar. Ja comprei o candeeiro.",
      matchAttempts: 0,
    },
  });

  // Booking 6: CANCELLED - Joao cancelled his drain cleaning
  await prisma.booking.create({
    data: {
      customerId: joao.id,
      serviceType: ServiceType.PLUMBING,
      serviceCategoryId: categoryMap["PLUMBING:Drain Cleaning"],
      urgency: BookingUrgency.SCHEDULED,
      status: BookingStatus.CANCELLED,
      scheduledFor: new Date("2026-03-15T09:00:00Z"),
      address: "Avenida da Liberdade 120, 5o Dto",
      city: "Lisboa",
      state: "Lisboa",
      zipCode: "1250-146",
      estimatedPrice: 65,
      problemDescription: "Esgoto da casa de banho lento. Preciso de desentupimento.",
      notes: "Cancelado pelo cliente - resolveu o problema sozinho.",
      matchAttempts: 0,
    },
  });

  console.log("  Created 6 bookings (COMPLETED x2, MATCHED, IN_PROGRESS, REQUESTED, CANCELLED)\n");

  // ---------------------------------------------------------------------------
  // 7. Create reviews on completed bookings
  // ---------------------------------------------------------------------------
  console.log("Creating reviews...");

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      customerId: maria.id,
      rating: 5,
      comment: "O Carlos foi excelente! Chegou a horas, explicou o problema e resolveu rapidamente. Muito profissional.",
      providerRating: 5,
      providerComment: "Cliente muito simpatica e organizada. Casa limpa e bem preparada para o servico.",
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      customerId: joao.id,
      rating: 4,
      comment: "Bom servico, tomadas instaladas corretamente. Demorou um pouco mais do que o previsto mas ficou bem feito.",
      providerRating: 5,
      providerComment: "Facil de trabalhar. Escritorio bem organizado e acessivel.",
    },
  });

  console.log("  Created 2 reviews\n");

  // ---------------------------------------------------------------------------
  // 8. Create payments for completed bookings
  // ---------------------------------------------------------------------------
  console.log("Creating payments...");

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      stripePaymentIntentId: "pi_demo_seed_001",
      amount: 9500, // EUR 95.00 in cents
      platformFee: 1425, // 15% platform fee
      providerPayout: 8075,
      currency: "eur",
      status: PaymentStatus.CAPTURED,
      capturedAt: new Date("2026-03-10T11:30:00Z"),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      stripePaymentIntentId: "pi_demo_seed_002",
      amount: 5500, // EUR 55.00 in cents
      platformFee: 825, // 15% platform fee
      providerPayout: 4675,
      currency: "eur",
      status: PaymentStatus.CAPTURED,
      capturedAt: new Date("2026-03-08T15:00:00Z"),
    },
  });

  console.log("  Created 2 payments\n");

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("=== Seed complete ===");
  console.log("Customers: Maria Silva, Joao Santos, Ana Costa, Beatriz Pereira");
  console.log("Providers: Carlos Oliveira (Plumber, Lisboa), Pedro Ferreira (Electrician, Porto),");
  console.log("           Rui Almeida (Multi, Amadora), Sofia Martins (Electrician, Cascais)");
  console.log("Bookings:  6 total (2 completed, 1 matched, 1 in-progress, 1 requested, 1 cancelled)");
  console.log("Reviews:   2 (on completed bookings)");
  console.log("Payments:  2 (on completed bookings)");
  console.log("\nAll demo users have password: demo123");
  console.log("Demo emails: maria.silva@demo.victor.pt, joao.santos@demo.victor.pt, etc.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
