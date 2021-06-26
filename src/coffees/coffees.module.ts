import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { Connection } from 'typeorm';

class AnyService {}
class DevelopmentAnyService {}
class ProductionAnyService {}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],
  providers: [
    {
      provide: AnyService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevelopmentAnyService
          : ProductionAnyService,
    },
    CoffeesService,
    {
      provide: COFFEE_BRANDS,
      useFactory: async (connection: Connection) => {
        // await connection.query("SELECT * from ...")
        const coffeeBrands = await Promise.resolve(['buddy brew', 'nescafe']);
        return coffeeBrands;
      },
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
