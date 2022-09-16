import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  Put,
  UseGuards,
  Req,
  Catch
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {TaskService} from './task.service';
import {TodolistService} from 'src/todolist/todolist.service';
import {CreateTaskDto} from './dto/create-task.dto';
import {CurrentTodoList} from 'src/todolist/decorators/current-todolist-decorator';
import {Todolist} from 'src/todolist/entities/todolist.entity';
import {UpdateTaskDto} from './dto/update-task-dto';
import {JwtAuthGuard} from 'src/auth/guards/jwt-auth.guard';
import extractHeader from 'src/utils/extract-header';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@Catch(QueryFailedError, EntityNotFoundError)
export class TasksController {
  constructor(private taskService: TaskService, private todoListService: TodolistService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/single/:id')
  getTaskById(@Param('id') id: string) {
    return this.taskService.findTaskById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:listID')
  readTodoListByID(@Param('listID') listID: string) {
    return this.taskService.findTaskFromListByID(listID);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTask(@Body() body: CreateTaskDto, @CurrentTodoList() todoList: Todolist, @Req() request: any) {
    const existTodoList = await this.todoListService.findTodoListByID(body.todoListId).then(result => {
      return result;
    });
    if (existTodoList.length == 0) {
      throw new BadRequestException('Error your list id is not available 😢');
    }
    if (body.name.trim().length == 0) {
      throw new BadRequestException('Name not empty');
    }

    const {userId} = extractHeader(request);
    body.userId = userId;
    return this.taskService.create(body, todoList);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async removeUser(@Param('id') id: string) {
    const taskExisting = await this.taskService.findTaskById(id);
    if (!taskExisting) {
      throw new NotFoundException('Cannot remove task because task not found 😢');
    }
    return this.taskService.remove(taskExisting);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async markTaskDone(@Param('id') id: string) {
    const taskExisting = await this.taskService.findTaskById(id);
    if (!taskExisting) {
      throw new NotFoundException('Cannot mark done this task because task not found 😢😭😭😭😭😭');
    }
    return this.taskService.markTaskDone(taskExisting);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const taskExisting = await this.taskService.findTaskById(id);
    if (!taskExisting) {
      throw new NotFoundException('Cannot update task because task not found 😢');
    }
    if (updateTaskDto.name.trim().length == 0) {
      throw new BadRequestException('Name not empty');
    }
    return this.taskService.updateTask(taskExisting, updateTaskDto.name);
  }
}
