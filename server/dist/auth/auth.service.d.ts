import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: any;
            email: any;
            role: any;
            emailVerified: any;
            creatorProfile: {
                id: any;
                displayName: any;
                verificationStatus: any;
            };
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: any;
            email: any;
            role: any;
            emailVerified: any;
            creatorProfile: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    logout(dto: LogoutDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: any;
        email: any;
        role: any;
        emailVerified: any;
        creatorProfile: any;
    }>;
    private hashPassword;
    private generateTokenPair;
    private getRefreshTokenExpiration;
}
//# sourceMappingURL=auth.service.d.ts.map