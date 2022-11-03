import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './index.entity';
import { IAttachmentCreate, IAttachmentUpdate } from './index.type';

@Injectable()
export class AttachmentService {
  constructor(@InjectRepository(Attachment) readonly repository: Repository<Attachment>) {}

  get() {
    return this.repository.find({ relations: { taskAttachments: true } });
  }

  create(param: IAttachmentCreate) {
    const { link, name } = param;
    if (!link || !name) throw new BadRequestException();
    const newAttachment = this.repository.create({ ...param, isActive: true });
    return this.repository.save(newAttachment);
  }

  async update(param: IAttachmentUpdate) {
    const { id } = param;
    if (!id) throw new BadRequestException();
    const attachment = await this.repository.findOneBy({ id });
    if (!attachment) throw new BadRequestException();
    const newAttachment = this.repository.create(param);
    return this.repository.save(newAttachment);
  }
}
