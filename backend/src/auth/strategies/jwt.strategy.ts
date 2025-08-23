import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET environment variable is missing!');
      console.error('🔧 Please set JWT_SECRET in your environment variables');
      console.error('📝 Example: JWT_SECRET=your-super-secret-key-here');
      throw new Error('JWT_SECRET environment variable is required for JWT authentication');
    }

    console.log('🔐 JWT Strategy initialized with secret:', jwtSecret ? 'Present' : 'Missing');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
