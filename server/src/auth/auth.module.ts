import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { VerifiedCreatorGuard } from './guards/verified-creator.guard';
import { PayoutEligibleGuard } from './guards/payout-eligible.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { TwofactorModule } from '../twofactor/twofactor.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    TwofactorModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET is not defined in environment variables. Please set JWT_SECRET in your .env file.',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: config.get('JWT_EXPIRES_IN') || '15m',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailVerifiedGuard,
    VerifiedCreatorGuard,
    PayoutEligibleGuard,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    EmailVerifiedGuard,
    VerifiedCreatorGuard,
    PayoutEligibleGuard,
  ],
})
export class AuthModule {}
