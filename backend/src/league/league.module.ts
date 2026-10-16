import { Module } from '@nestjs/common';
import { LeagueController } from './league.controller';
import { LineupService } from './lineup.service';
import { MatchesService } from './matches.service';

@Module({
  controllers: [LeagueController],
  providers: [LineupService, MatchesService],
})
export class LeagueModule {}
