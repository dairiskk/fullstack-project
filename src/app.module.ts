import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { PokemonController } from './pokemon/pokemon.controller';

@Module({
  imports: [AuthModule, UserModule, PrismaModule],
  controllers: [AppController, PokemonController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
