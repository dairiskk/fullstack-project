import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Import PrismaModule here
  providers: [UserService],
  exports: [UserService], // Export UserService so other modules (like AuthModule) can use it
})
export class UserModule {}
