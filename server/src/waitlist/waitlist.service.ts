import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(private prisma: PrismaService) {}

  async addToWaitlist(dto: JoinWaitlistDto) {
    const email = dto.email.toLowerCase();

    // Check if email already exists on waitlist
    const existing = await this.prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already on waitlist');
    }

    // Check if user has already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Add to waitlist
    const waitlistEntry = await this.prisma.waitlist.create({
      data: {
        email,
        country: dto.country,
        age: dto.age,
        heardFrom: dto.heardFrom,
      },
    });

    this.logger.log(`Added ${email} to waitlist`);

    return {
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
      },
    };
  }

  async checkEmail(email: string) {
    const entry = await this.prisma.waitlist.findUnique({
      where: { email: email.toLowerCase() },
    });

    return {
      isOnWaitlist: !!entry,
      email: email.toLowerCase(),
    };
  }

  async getWaitlistCount() {
    const count = await this.prisma.waitlist.count();

    return {
      count,
    };
  }

  async getAllWaitlistEntries(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.waitlist.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.waitlist.count(),
    ]);

    return {
      data: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async removeFromWaitlist(email: string) {
    const entry = await this.prisma.waitlist.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!entry) {
      throw new ConflictException('Email not found on waitlist');
    }

    await this.prisma.waitlist.delete({
      where: { id: entry.id },
    });

    this.logger.log(`Removed ${email} from waitlist`);

    return {
      success: true,
      message: 'Successfully removed from waitlist',
    };
  }
}
