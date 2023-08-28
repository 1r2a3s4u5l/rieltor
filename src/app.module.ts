import { Module } from '@nestjs/common';
import { RieltorModule } from './rieltor/rieltor.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    PrismaModule,
    RieltorModule,
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}