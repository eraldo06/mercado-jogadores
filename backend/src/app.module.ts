import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClubsModule } from './clubs/clubs.module';
import { LeagueModule } from './league/league.module';
import { MarketModule } from './market/market.module';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PlayersModule,
    ClubsModule,
    MarketModule,
    LeagueModule,
  ],
})
export class AppModule {}
