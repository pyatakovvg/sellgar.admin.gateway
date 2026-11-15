import { CategoryEntity } from '../entity/category.entity';
import { CreateCategoryDto } from '../controller/dto/create-category.dto';
import { UpdateCategoryDto } from '../controller/dto/update-category.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { firstValueFrom } from 'rxjs';

import { CategoryTreeEntity } from '../entity/category-tree.entity';

@Injectable()
export class CategoryGateway {
  constructor(@Inject('STORE_COMMAND_SERVICE') private readonly client: ClientProxy) {}

  getTree(shopUuid: string): Promise<CategoryTreeEntity> {
    return this.request('store.category.getTree', { shopUuid }, CategoryTreeEntity);
  }

  getByUuid(uuid: string): Promise<CategoryEntity> {
    return this.request('store.category.getByUuid', { uuid }, CategoryEntity);
  }

  create(input: CreateCategoryDto): Promise<CategoryEntity> {
    return this.request('store.category.create', input, CategoryEntity);
  }

  update(uuid: string, input: UpdateCategoryDto): Promise<CategoryEntity> {
    return this.request('store.category.update', { ...input, uuid }, CategoryEntity);
  }

  private async request<T extends object>(command: string, payload: object, Type: ClassConstructor<T>): Promise<T> {
    const result: unknown = await firstValueFrom(this.client.send({ cmd: command }, payload));
    const entity = plainToInstance(Type, result, { excludeExtraneousValues: true });
    await validateOrReject(entity);
    return entity;
  }
}
