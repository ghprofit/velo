import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerifiedCreatorGuard implements CanActivate {
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

    // Check email verification
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Email verification required. Please verify your email address before uploading content.',
      );
    }

    // Check KYC verification
    if (user.creatorProfile.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenException(
        'KYC verification required. Please complete your identity verification before uploading content.',
      );
    }

    return true;
  }
}
