import { Injectable } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      brand: 'Buddy Brew',
      name: 'Shipwreck Roast',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: number) {
    return this.coffees.find((coffee) => coffee.id === id);
  }

  create(coffee: CreateCoffeeDto) {
    this.coffees.push({ id: this.coffees.length + 1, ...coffee });
    return this.coffees;
  }

  update(id: number, coffee: UpdateCoffeeDto) {
    return this.coffees.map((cof) => {
      if (cof.id === id) {
        return { ...cof, ...coffee };
      }
      return cof;
    });
  }

  delete(id: number) {
    return (this.coffees = this.coffees.filter((cof) => cof.id !== id));
  }
}
