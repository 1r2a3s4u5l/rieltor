import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RieltorService } from './rieltor.service';
import { RieltorController } from './rieltor.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import {
  AccessTokenStrategy,
  RefreshTokenFromBearerStrategy,
  RefreshTokenFromCookieStrategy,
} from './strategies';
import { AccessTokenGuard } from '../common/guards/access-token.guard';

@Module({
  imports: [JwtModule.register({}), PrismaModule],
  controllers: [RieltorController],
  providers: [
    RieltorService,
    AccessTokenStrategy,
    RefreshTokenFromBearerStrategy,
    RefreshTokenFromCookieStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
      
    },
  ],
})
export class RieltorModule {}
