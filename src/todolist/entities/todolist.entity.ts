import { type } from "os";
import { Task } from "src/task/entities/task.entity";
import { User } from 'src/users/entities/user.entity';
import { Uuidstorage } from 'src/uuidstorage/entities/uuidstorage.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";

@Entity()
export class Todolist {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({default:true})
  isActive: boolean

  @Column()
  userId: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @ManyToOne(() => User, (user) => user.id, { cascade: true, onDelete:'CASCADE', onUpdate: 'CASCADE' })
  user: User;

  @OneToMany(() => Task, (task) => task.todoListId)
  tasks: Task[];

  @AfterInsert()
  logInsert() {
    console.log("😀Inserted TodoListwith id", this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log("😀Updated TodoListwith id", this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log("😀Removed TodoListwith id", this.id);
  }
}
