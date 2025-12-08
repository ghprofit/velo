import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with realistic data...');

  // Clear existing data (in correct order to avoid foreign key constraints)
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.contentView.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.buyerSession.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.content.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // Create test users
  console.log('Creating test users...');
  const creator1 = await prisma.user.create({
    data: {
      email: 'creator1@test.com',
      displayName: 'Emma Wilson',
      firstName: 'Emma',
      lastName: 'Wilson',
      password: hashedPassword,
      emailVerified: true,
      role: 'CREATOR',
      creatorProfile: {
        create: {
          bio: 'Professional content creator specializing in educational videos and tutorials. Former software engineer at Google.',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
          displayName: 'Emma Wilson',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });

  const creator2 = await prisma.user.create({
    data: {
      email: 'creator2@test.com',
      displayName: 'Alex Martinez',
      firstName: 'Alex',
      lastName: 'Martinez',
      password: hashedPassword,
      emailVerified: true,
      role: 'CREATOR',
      creatorProfile: {
        create: {
          bio: 'Certified fitness trainer and wellness coach. 10+ years of experience helping people achieve their health goals.',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          displayName: 'Alex Martinez',
          verificationStatus: 'PENDING',
        },
      },
    },
  });

  // Fetch creator profiles
  const creatorProfile1 = await prisma.creatorProfile.findUnique({
    where: { userId: creator1.id },
  });

  const creatorProfile2 = await prisma.creatorProfile.findUnique({
    where: { userId: creator2.id },
  });

  if (!creatorProfile1 || !creatorProfile2) {
    throw new Error('Creator profiles not found');
  }

  // Create more diverse content items
  console.log('Creating content items...');

  // Emma's content (tech/education)
  const content1 = await prisma.content.create({
    data: {
      title: 'Advanced JavaScript Tutorial Series',
      description: 'Comprehensive JavaScript course covering ES6+, async/await, closures, prototypes, and modern frameworks. Perfect for intermediate developers.',
      price: 29.99,
      creatorId: creatorProfile1.id,
      thumbnailUrl: 'https://picsum.photos/seed/js-tutorial/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator1/js-tutorial-series.mp4',
      s3Bucket: 'velo-content',
      fileSize: 260000000,
      duration: 3600,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  const content2 = await prisma.content.create({
    data: {
      title: 'React Masterclass 2024',
      description: 'Learn React from scratch including hooks, context, Redux, and Next.js. Build 5 real-world projects.',
      price: 39.99,
      creatorId: creatorProfile1.id,
      thumbnailUrl: 'https://picsum.photos/seed/react-master/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator1/react-masterclass.mp4',
      s3Bucket: 'velo-content',
      fileSize: 180000000,
      duration: 2700,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000), // 10 months ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  const content3 = await prisma.content.create({
    data: {
      title: 'Node.js Backend Development',
      description: 'Build scalable REST APIs with Node.js, Express, and MongoDB. Includes authentication, testing, and deployment.',
      price: 34.99,
      creatorId: creatorProfile1.id,
      thumbnailUrl: 'https://picsum.photos/seed/nodejs-backend/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator1/nodejs-backend.mp4',
      s3Bucket: 'velo-content',
      fileSize: 220000000,
      duration: 3200,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  const content4 = await prisma.content.create({
    data: {
      title: 'TypeScript Complete Guide',
      description: 'Master TypeScript for enterprise applications. Generics, decorators, and advanced patterns.',
      price: 24.99,
      creatorId: creatorProfile1.id,
      thumbnailUrl: 'https://picsum.photos/seed/typescript-guide/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator1/typescript-guide.mp4',
      s3Bucket: 'velo-content',
      fileSize: 150000000,
      duration: 2400,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  // Alex's content (fitness)
  const content5 = await prisma.content.create({
    data: {
      title: '30-Day Fitness Challenge',
      description: 'Complete workout program with daily exercises, nutrition guide, and progress tracking. No equipment needed.',
      price: 24.99,
      creatorId: creatorProfile2.id,
      thumbnailUrl: 'https://picsum.photos/seed/fitness-challenge/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator2/fitness-challenge.mp4',
      s3Bucket: 'velo-content',
      fileSize: 95000000,
      duration: 1800,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000), // 8 months ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  const content6 = await prisma.content.create({
    data: {
      title: 'Yoga for Beginners',
      description: 'Gentle introduction to yoga with step-by-step instructions. Perfect for stress relief and flexibility.',
      price: 19.99,
      creatorId: creatorProfile2.id,
      thumbnailUrl: 'https://picsum.photos/seed/yoga-beginners/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator2/yoga-beginners.mp4',
      s3Bucket: 'velo-content',
      fileSize: 85000000,
      duration: 1500,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 5 months ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  const content7 = await prisma.content.create({
    data: {
      title: 'HIIT Workout Collection',
      description: 'High-intensity interval training workouts for maximum fat burn. 20-minute sessions.',
      price: 29.99,
      creatorId: creatorProfile2.id,
      thumbnailUrl: 'https://picsum.photos/seed/hiit-workout/400/300',
      contentType: 'VIDEO',
      s3Key: 'content/creator2/hiit-workout.mp4',
      s3Bucket: 'velo-content',
      fileSize: 120000000,
      duration: 2000,
      status: 'APPROVED',
      isPublished: true,
      publishedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
      viewCount: 0,
      purchaseCount: 0,
      totalRevenue: 0,
    },
  });

  const allContent = [content1, content2, content3, content4, content5, content6, content7];

  // Create buyer sessions (need more for realistic purchase distribution)
  console.log('Creating buyer sessions...');
  const buyerSessions = [];
  for (let i = 1; i <= 500; i++) {
    const session = await prisma.buyerSession.create({
      data: {
        sessionToken: `buyer_session_${nanoid()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    buyerSessions.push(session);
  }

  // Generate realistic purchase data spread over 365 days
  console.log('Creating realistic purchase records...');

  // Content purchase weights (some content is more popular)
  const contentWeights = [
    { content: content1, weight: 25 }, // JS Tutorial - very popular
    { content: content2, weight: 30 }, // React - most popular
    { content: content3, weight: 20 }, // Node.js
    { content: content4, weight: 15 }, // TypeScript
    { content: content5, weight: 22 }, // Fitness Challenge
    { content: content6, weight: 18 }, // Yoga
    { content: content7, weight: 25 }, // HIIT - recent & popular
  ];

  const selectByWeight = <T extends { weight: number }>(items: T[]): T => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item;
    }
    return items[0];
  };

  // Generate purchases with realistic patterns
  const purchases: Array<{
    contentId: string;
    amount: number;
    date: Date;
    sessionIndex: number;
  }> = [];

  // Growth pattern: more purchases in recent months
  const getMonthlyMultiplier = (daysAgo: number): number => {
    if (daysAgo > 330) return 0.3; // 11+ months ago
    if (daysAgo > 270) return 0.5; // 9-11 months ago
    if (daysAgo > 210) return 0.7; // 7-9 months ago
    if (daysAgo > 150) return 0.9; // 5-7 months ago
    if (daysAgo > 90) return 1.2; // 3-5 months ago
    if (daysAgo > 30) return 1.5; // 1-3 months ago
    return 2.0; // Last month - most activity
  };

  // Day of week pattern (more on weekends)
  const getDayOfWeekMultiplier = (date: Date): number => {
    const day = date.getDay();
    if (day === 0 || day === 6) return 1.3; // Weekend
    if (day === 1 || day === 5) return 1.1; // Mon/Fri
    return 1.0; // Tue-Thu
  };

  let sessionIndex = 0;

  // Generate ~300 purchases spread across the year
  for (let daysAgo = 365; daysAgo >= 0; daysAgo--) {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const monthMultiplier = getMonthlyMultiplier(daysAgo);
    const dayMultiplier = getDayOfWeekMultiplier(date);

    // Base probability of purchase per day, adjusted by multipliers
    const basePurchasesPerDay = 0.8;
    const adjustedRate = basePurchasesPerDay * monthMultiplier * dayMultiplier;

    // Random variation
    const numPurchases = Math.floor(adjustedRate + Math.random() * adjustedRate);

    for (let i = 0; i < numPurchases && sessionIndex < buyerSessions.length; i++) {
      const selectedContent = selectByWeight(contentWeights);

      // Only create purchase if content was published before this date
      if (new Date(selectedContent.content.publishedAt!) <= date) {
        // Add random hours to the date
        const purchaseDate = new Date(date);
        purchaseDate.setHours(Math.floor(Math.random() * 24));
        purchaseDate.setMinutes(Math.floor(Math.random() * 60));

        purchases.push({
          contentId: selectedContent.content.id,
          amount: selectedContent.content.price,
          date: purchaseDate,
          sessionIndex: sessionIndex++,
        });
      }
    }
  }

  // Create the purchase records
  for (const purchase of purchases) {
    await prisma.purchase.create({
      data: {
        contentId: purchase.contentId,
        buyerSessionId: buyerSessions[purchase.sessionIndex].id,
        amount: purchase.amount,
        paymentProvider: Math.random() > 0.4 ? 'STRIPE' : 'PAYPAL',
        accessToken: nanoid(),
        status: 'COMPLETED',
        createdAt: purchase.date,
      },
    });
  }

  console.log(`  Created ${purchases.length} purchases`);

  // Update content stats based on purchases
  console.log('Updating content purchase stats...');

  for (const content of allContent) {
    const contentPurchases = purchases.filter((p) => p.contentId === content.id);
    const purchaseCount = contentPurchases.length;
    const totalRevenue = contentPurchases.reduce((sum, p) => sum + p.amount, 0);

    await prisma.content.update({
      where: { id: content.id },
      data: {
        purchaseCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
    });
  }

  // Update creator profile stats
  const creator1Purchases = purchases.filter((p) =>
    [content1.id, content2.id, content3.id, content4.id].includes(p.contentId)
  );
  const creator2Purchases = purchases.filter((p) =>
    [content5.id, content6.id, content7.id].includes(p.contentId)
  );

  await prisma.creatorProfile.update({
    where: { id: creatorProfile1.id },
    data: {
      totalEarnings: Math.round(creator1Purchases.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      totalPurchases: creator1Purchases.length,
    },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorProfile2.id },
    data: {
      totalEarnings: Math.round(creator2Purchases.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
      totalPurchases: creator2Purchases.length,
    },
  });

  // Create payouts with different statuses
  console.log('Creating payout records...');

  // Historical payouts for creator1
  const payoutDates = [
    { daysAgo: 300, amount: 450.0, status: 'COMPLETED' },
    { daysAgo: 270, amount: 380.0, status: 'COMPLETED' },
    { daysAgo: 240, amount: 520.0, status: 'COMPLETED' },
    { daysAgo: 210, amount: 610.0, status: 'COMPLETED' },
    { daysAgo: 180, amount: 480.0, status: 'COMPLETED' },
    { daysAgo: 150, amount: 550.0, status: 'COMPLETED' },
    { daysAgo: 120, amount: 720.0, status: 'COMPLETED' },
    { daysAgo: 90, amount: 680.0, status: 'COMPLETED' },
    { daysAgo: 60, amount: 890.0, status: 'COMPLETED' },
    { daysAgo: 30, amount: 950.0, status: 'COMPLETED' },
    { daysAgo: 5, amount: 400.0, status: 'PROCESSING' },
    { daysAgo: 2, amount: 250.0, status: 'PENDING' },
  ];

  for (const payout of payoutDates) {
    await prisma.payout.create({
      data: {
        creatorId: creatorProfile1.id,
        amount: payout.amount,
        status: payout.status as any,
        paymentMethod: Math.random() > 0.5 ? 'bank_transfer' : 'paypal',
        createdAt: new Date(Date.now() - payout.daysAgo * 24 * 60 * 60 * 1000),
        processedAt:
          payout.status === 'COMPLETED'
            ? new Date(Date.now() - (payout.daysAgo - 2) * 24 * 60 * 60 * 1000)
            : undefined,
      },
    });
  }

  // Payouts for creator2
  const creator2Payouts = [
    { daysAgo: 180, amount: 320.0, status: 'COMPLETED' },
    { daysAgo: 120, amount: 280.0, status: 'COMPLETED' },
    { daysAgo: 60, amount: 450.0, status: 'COMPLETED' },
    { daysAgo: 30, amount: 380.0, status: 'COMPLETED' },
    { daysAgo: 3, amount: 200.0, status: 'PROCESSING' },
  ];

  for (const payout of creator2Payouts) {
    await prisma.payout.create({
      data: {
        creatorId: creatorProfile2.id,
        amount: payout.amount,
        status: payout.status as any,
        paymentMethod: Math.random() > 0.5 ? 'bank_transfer' : 'paypal',
        createdAt: new Date(Date.now() - payout.daysAgo * 24 * 60 * 60 * 1000),
        processedAt:
          payout.status === 'COMPLETED'
            ? new Date(Date.now() - (payout.daysAgo - 2) * 24 * 60 * 60 * 1000)
            : undefined,
      },
    });
  }

  // Create notifications
  console.log('Creating notifications...');

  // Recent notifications for creator1
  const notifications1 = [
    {
      type: 'PURCHASE_MADE',
      title: 'New Purchase!',
      message: 'Someone purchased "React Masterclass 2024" for $39.99',
      isRead: false,
      daysAgo: 0,
    },
    {
      type: 'PURCHASE_MADE',
      title: 'New Purchase!',
      message: 'Someone purchased "Advanced JavaScript Tutorial Series" for $29.99',
      isRead: false,
      daysAgo: 1,
    },
    {
      type: 'PAYOUT_SENT',
      title: 'Payout Completed',
      message: 'Your payout of $950.00 has been processed and sent to your bank account',
      isRead: true,
      daysAgo: 28,
    },
    {
      type: 'CONTENT_APPROVED',
      title: 'Content Approved',
      message: 'Your content "TypeScript Complete Guide" has been approved and is now live',
      isRead: true,
      daysAgo: 88,
    },
    {
      type: 'MILESTONE_REACHED',
      title: 'Milestone Reached!',
      message: 'Congratulations! You have reached 100 purchases on "React Masterclass 2024"',
      isRead: false,
      daysAgo: 15,
    },
    {
      type: 'PLATFORM_UPDATE',
      title: 'New Feature: Analytics Dashboard',
      message: 'We have added new analytics features to help you track your content performance',
      isRead: false,
      daysAgo: 7,
    },
    {
      type: 'SUPPORT_REPLY',
      title: 'Support Team Replied',
      message: 'Your support ticket regarding payout timing has a new reply',
      isRead: false,
      daysAgo: 3,
    },
  ];

  for (const notif of notifications1) {
    await prisma.notification.create({
      data: {
        userId: creator1.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.isRead,
        createdAt: new Date(Date.now() - notif.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Notifications for creator2
  const notifications2 = [
    {
      type: 'PURCHASE_MADE',
      title: 'New Purchase!',
      message: 'Someone purchased "HIIT Workout Collection" for $29.99',
      isRead: false,
      daysAgo: 0,
    },
    {
      type: 'PURCHASE_MADE',
      title: 'New Purchase!',
      message: 'Someone purchased "30-Day Fitness Challenge" for $24.99',
      isRead: false,
      daysAgo: 2,
    },
    {
      type: 'PAYOUT_SENT',
      title: 'Payout Completed',
      message: 'Your payout of $380.00 has been processed successfully',
      isRead: true,
      daysAgo: 28,
    },
    {
      type: 'CONTENT_APPROVED',
      title: 'Content Approved',
      message: 'Your content "HIIT Workout Collection" has been approved',
      isRead: true,
      daysAgo: 58,
    },
    {
      type: 'VERIFICATION_REMINDER',
      title: 'Complete Your Verification',
      message: 'Please complete your identity verification to enable payouts',
      isRead: false,
      daysAgo: 1,
    },
    {
      type: 'PLATFORM_UPDATE',
      title: 'New Feature: Mobile App',
      message: 'The Velo mobile app is now available on iOS and Android',
      isRead: true,
      daysAgo: 14,
    },
  ];

  for (const notif of notifications2) {
    await prisma.notification.create({
      data: {
        userId: creator2.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.isRead,
        createdAt: new Date(Date.now() - notif.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create content views with realistic demographic data
  console.log('Creating content views with demographic data...');

  // Realistic city data by country
  const locationData = [
    { country: 'United States', countryCode: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Miami', 'Boston', 'Denver'], weight: 35 },
    { country: 'United Kingdom', countryCode: 'GB', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh'], weight: 15 },
    { country: 'Canada', countryCode: 'CA', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'], weight: 12 },
    { country: 'Germany', countryCode: 'DE', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'], weight: 10 },
    { country: 'France', countryCode: 'FR', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux'], weight: 8 },
    { country: 'Australia', countryCode: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'], weight: 7 },
    { country: 'India', countryCode: 'IN', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'], weight: 5 },
    { country: 'Brazil', countryCode: 'BR', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'], weight: 4 },
    { country: 'Japan', countryCode: 'JP', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo'], weight: 3 },
    { country: 'Netherlands', countryCode: 'NL', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'], weight: 1 },
  ];

  const devices = [
    { deviceType: 'desktop', weight: 55 },
    { deviceType: 'mobile', weight: 35 },
    { deviceType: 'tablet', weight: 10 },
  ];

  const browsers = [
    { browser: 'Chrome', weight: 50 },
    { browser: 'Safari', weight: 25 },
    { browser: 'Firefox', weight: 12 },
    { browser: 'Edge', weight: 10 },
    { browser: 'Opera', weight: 3 },
  ];

  const operatingSystems = {
    desktop: ['Windows 11', 'Windows 10', 'macOS Sonoma', 'macOS Ventura', 'Ubuntu 22.04', 'Fedora 39'],
    mobile: ['iOS 17', 'iOS 16', 'Android 14', 'Android 13', 'Android 12'],
    tablet: ['iPadOS 17', 'iPadOS 16', 'Android 14', 'Android 13'],
  };

  const selectLocation = () => {
    const totalWeight = locationData.reduce((sum, loc) => sum + loc.weight, 0);
    let random = Math.random() * totalWeight;
    for (const loc of locationData) {
      random -= loc.weight;
      if (random <= 0) {
        return {
          country: loc.country,
          countryCode: loc.countryCode,
          city: loc.cities[Math.floor(Math.random() * loc.cities.length)],
        };
      }
    }
    return { country: 'United States', countryCode: 'US', city: 'New York' };
  };

  // Generate views for each content item with realistic patterns
  let totalViewsCreated = 0;
  const allViewsData: Array<{
    contentId: string;
    country: string;
    countryCode: string;
    city: string;
    region: string;
    deviceType: string;
    browser: string;
    os: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
  }> = [];

  for (const content of allContent) {
    // Calculate views based on content age and popularity
    const publishedDate = new Date(content.publishedAt!);
    const daysSincePublished = Math.floor((Date.now() - publishedDate.getTime()) / (24 * 60 * 60 * 1000));

    // Base view count scaled by popularity
    const popularityFactor = contentWeights.find((c) => c.content.id === content.id)?.weight || 20;
    const baseViews = Math.min(daysSincePublished * (popularityFactor / 10), 500);
    const numViews = Math.floor(baseViews * (0.8 + Math.random() * 0.4));

    let contentViewCount = 0;
    for (let i = 0; i < numViews; i++) {
      const location = selectLocation();
      const selectedDevice = selectByWeight(devices);
      const selectedBrowser = selectByWeight(browsers);
      const osOptions = operatingSystems[selectedDevice.deviceType as keyof typeof operatingSystems];
      const selectedOs = osOptions[Math.floor(Math.random() * osOptions.length)];

      // Random date between publish date and now
      const maxDaysAgo = Math.min(daysSincePublished, 365);
      const daysAgo = Math.floor(Math.random() * maxDaysAgo);
      const hoursAgo = Math.floor(Math.random() * 24);
      const viewDate = new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);

      // Only create view if it's after the publish date
      if (viewDate >= publishedDate) {
        allViewsData.push({
          contentId: content.id,
          country: location.country,
          countryCode: location.countryCode,
          city: location.city,
          region: `${location.city} Metro`,
          deviceType: selectedDevice.deviceType,
          browser: selectedBrowser.browser,
          os: selectedOs,
          ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: `Mozilla/5.0 (${selectedOs}) ${selectedBrowser.browser}/${Math.floor(70 + Math.random() * 30)}.0`,
          createdAt: viewDate,
        });
        contentViewCount++;
      }
    }

    // Update content view count
    await prisma.content.update({
      where: { id: content.id },
      data: { viewCount: contentViewCount },
    });
  }

  // Batch insert all content views (much faster than individual creates)
  const BATCH_SIZE = 100;
  for (let i = 0; i < allViewsData.length; i += BATCH_SIZE) {
    const batch = allViewsData.slice(i, i + BATCH_SIZE);
    await prisma.contentView.createMany({
      data: batch,
    });
    totalViewsCreated += batch.length;
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`    Progress: ${totalViewsCreated}/${allViewsData.length} views created...`);
    }
  }

  // Update creator profile total views
  const creator1ContentIds = [content1.id, content2.id, content3.id, content4.id];
  const creator2ContentIds = [content5.id, content6.id, content7.id];

  const creator1Views = await prisma.content.aggregate({
    where: { id: { in: creator1ContentIds } },
    _sum: { viewCount: true },
  });

  const creator2Views = await prisma.content.aggregate({
    where: { id: { in: creator2ContentIds } },
    _sum: { viewCount: true },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorProfile1.id },
    data: { totalViews: creator1Views._sum.viewCount || 0 },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorProfile2.id },
    data: { totalViews: creator2Views._sum.viewCount || 0 },
  });

  console.log(`  Created ${totalViewsCreated} content views with demographic data`);

  // Print summary
  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Data Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Users: 2 creators`);
  console.log(`  Content items: ${allContent.length}`);
  console.log(`  Purchases: ${purchases.length} (spread across 365 days)`);
  console.log(`  Payouts: ${payoutDates.length + creator2Payouts.length}`);
  console.log(`  Notifications: ${notifications1.length + notifications2.length}`);
  console.log(`  Content views: ${totalViewsCreated}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔐 Test Accounts:');
  console.log('  Creator 1: creator1@test.com (password: Test123!)');
  console.log('    - Emma Wilson, Tech/Education content');
  console.log(`    - ${creator1Purchases.length} purchases, $${creator1Purchases.reduce((s, p) => s + p.amount, 0).toFixed(2)} revenue`);
  console.log('  Creator 2: creator2@test.com (password: Test123!)');
  console.log('    - Alex Martinez, Fitness content');
  console.log(`    - ${creator2Purchases.length} purchases, $${creator2Purchases.reduce((s, p) => s + p.amount, 0).toFixed(2)} revenue`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
