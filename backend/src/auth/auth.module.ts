import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BusinessProfileService } from './business-profile.service';
import { OAuthDebugService } from './oauth-debug.service';
import { FacebookApiService } from './facebook-api.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { User } from '../entities';
import { SocialProfile } from '../entities/social-profile.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: 'your-super-secret-jwt-key-for-development',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, SocialProfile]),
  ],
  controllers: [AuthController],
  providers: [AuthService, BusinessProfileService, OAuthDebugService, FacebookApiService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  exports: [AuthService, BusinessProfileService, OAuthDebugService, FacebookApiService],
})
export class AuthModule {}
