import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayoutEligibleGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        creatorProfile: {
          select: {
            verificationStatus: true,
            payoutSetupCompleted: true,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!user.creatorProfile) {
      throw new ForbiddenException('Creator profile not found');
    }

    const missingRequirements: string[] = [];

    // Check email verification
    if (!user.emailVerified) {
      missingRequirements.push('Email verification');
    }

    // Check KYC verification
    if (user.creatorProfile.verificationStatus !== 'VERIFIED') {
      missingRequirements.push('KYC verification');
    }

    // Check bank details setup
    if (!user.creatorProfile.payoutSetupCompleted) {
      missingRequirements.push('Bank details setup');
    }

    if (missingRequirements.length > 0) {
      throw new ForbiddenException(
        `Payout request not allowed. Please complete the following requirements: ${missingRequirements.join(', ')}`,
      );
    }

    return true;
  }
}
