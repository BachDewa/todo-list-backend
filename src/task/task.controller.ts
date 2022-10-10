import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  UseGuards,
  Req,
  Catch,
  NotAcceptableException,
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
import {EntityNotFoundError, QueryFailedError, TypeORMError} from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { ReorderTaskDTO } from './dto/reorder-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@Catch(QueryFailedError, EntityNotFoundError, TypeORMError)
export class TasksController {
  constructor(private taskService: TaskService, private todoListService: TodolistService, private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:listID')
  async readTodoListByID(@Param('listID') listID: string) {
    try { return this.taskService.findTaskFromListByID(listID);} catch {
      throw new NotFoundException('😓😓Cannot find task from this list');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/single/:id')
  async getTaskById(@Param('id') id: string) { return this.taskService.findTaskById(id); }

  @Get('/index/assign')
  async assignIndexForAllTask() { return this.taskService.setIndexForAllTask(); }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTask(@Body() body: CreateTaskDto, @CurrentTodoList() todoList: Todolist, @Req() request: any) {
    const {userId} = extractHeader(request);
    const existTodoList = await this.todoListService.findTodoListByID(body.todoListId).then((result) => { return result;  });
    if (existTodoList.length == 0) {  throw new NotFoundException('Not found list id 😢');  }
    if (body.name.trim().length == 0) {   throw new NotAcceptableException('Name not empty');  }
    body.userId = userId;
    return this.taskService.create(body, todoList);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async removeUser(@Param('id') id: string) {
    try {
      const taskExisting = await this.taskService.findTaskById(id);
      return this.taskService.remove(taskExisting);
    } catch {   throw new NotFoundException('Cannot remove task because task not found 😢');   }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async markTaskDone(@Param('id') id: string) {
    try {
      const taskExisting = await this.taskService.findTaskById(id);
      if (!taskExisting) throw new NotFoundException('Cannot mark done this task because task not found 😢😭😭😭😭😭');
      return this.taskService.markTaskDone(taskExisting);
    } catch {   throw new NotFoundException('Cannot mark done this task because task not found ');  }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    if (updateTaskDto.name.trim().length == 0) throw new NotAcceptableException('Name not empty');
    else try {
      const taskExisting = await this.taskService.findTaskById(id);
      return this.taskService.updateTask(taskExisting, updateTaskDto.name);
    } catch {   throw new NotFoundException('Cannot update task because task not found 😢');    }
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('/query/reorders')
  async reorderTask(@Body() body: ReorderTaskDTO) {
    const needReorderTask = await this.taskService.findTaskById(body.taskReorderID);
    // Swap task to top
    if (body.taskFirstID === 'swap-top-list') {
      const secondTask = await this.taskService.findTaskById(body.taskSecondID);
      return this.taskService.reorderTaskToTop(needReorderTask,secondTask);
    }
    // Swap task to bottom
    if (body.taskSecondID === 'swap-bottom-list') {
      const firstTask = await this.taskService.findTaskById(body.taskFirstID);
      return this.taskService.reorderTaskToBottom(needReorderTask,firstTask);
    }
    // Swap task in between
    const firstTask = await this.taskService.findTaskById(body.taskFirstID);
    const secondTask = await this.taskService.findTaskById(body.taskSecondID);
    if (!firstTask || !secondTask || !needReorderTask) throw new NotFoundException('Not found task');
    return await this.taskService.reorderTask(firstTask,secondTask,needReorderTask)
  }
}
