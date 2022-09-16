import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {Todolist} from './entities/todolist.entity';
import { CreateTodolistDto } from './dto/create-todolist.dto';
import { UuidstorageService } from 'src/uuidstorage/uuidstorage.service';
@Injectable()
export class TodolistService {
  constructor(@InjectRepository(Todolist) private repo: Repository<Todolist>, private uuidStorageService: UuidstorageService) {}

  async findAll() {
    const TodoList = await this.repo
    .createQueryBuilder('todolist')
    .where('todolist.isActive = :isActive', {isActive: true})
    .orderBy('todolist.createdDate','DESC')
    .getMany();
    return TodoList;
  }

  async findListByUserId(userId: String) {
    const TodoList = await this.repo
    .createQueryBuilder('todolist')
    .where('todolist.isActive = :isActive', {isActive: true})
    .andWhere('todolist.userId = :userId', {userId: userId})
    .orderBy('todolist.createdDate','DESC')
    .getMany();
    return TodoList;
  }

  async create(todoListDto: CreateTodolistDto) {
    console.log(todoListDto.userId);
    
    const todoList = await this.repo.create(todoListDto);
    //find UUID unused
    const uuid = await this.uuidStorageService.findUnuse();
    // Set new uuID for this list
    todoList.id = uuid.id;
    // Mark this uuid is used
    await this.uuidStorageService.setFlag(uuid.id);
    return this.repo.save(todoList);
  }

  async remove(todoList: Todolist) {
    todoList.isActive = false;
    return this.repo.save(todoList);
  }

  async updateList(todoList: Todolist, listName: string) {
    todoList.name = listName;
    return this.repo.save(todoList);
  }

  async findTodoListByID(id: string) {
    const TodoList = await this.repo.find({id:id, isActive:true})
    return TodoList;
  }

  async findTodoListByName(listName: string) {
    const firstTodoList = await this.repo
      .createQueryBuilder('todolist')
      .where('todolist.listName = :listName', {listName: listName})
      .andWhere('todolist.isActive = :isActive', {isActive: true})
      .getOne();
    return firstTodoList;
  }
}
