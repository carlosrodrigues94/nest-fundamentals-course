import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { Connection, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,

    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,

    private readonly connection: Connection,
  ) {}

  async findAll({ limit, offset }: PaginationQueryDto) {
    const coffees = await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });
    return coffees;
  }

  async findOne(id: number) {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavors'],
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }
    return coffee;
  }

  async create(data: CreateCoffeeDto) {
    const flavors = await Promise.all(
      data.flavors.map((name) => this.preloadFavorByName(name)),
    );

    const coffee = this.coffeeRepository.create({ ...data, flavors });
    await this.coffeeRepository.save(coffee);
    return coffee;
  }

  async update(id: number, data: UpdateCoffeeDto) {
    const flavors =
      data.flavors &&
      (await Promise.all(
        data.flavors.map((name) => this.preloadFavorByName(name)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id,
      ...data,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }

    await this.coffeeRepository.save(coffee);
    return coffee;
  }

  async delete(id: number) {
    const coffee = await this.coffeeRepository.findOne(id);
    await this.coffeeRepository.remove(coffee);

    return { coffe: `${id} deleted with success` };
  }

  async recommendCoffe(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({ name });

    if (existingFlavor) return existingFlavor;

    return this.flavorRepository.create({ name });
  }
}
