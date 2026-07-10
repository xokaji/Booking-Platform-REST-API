import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: { ...dto, ownerId },
    });
    return { message: 'Service created successfully', data: service };
  }

  async findAll(query: QueryServiceDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.service.count({ where }),
    ]);

    return {
      message: 'Services retrieved successfully',
      data: {
        items,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  async findOne(id: string) {
    const service = await this.findServiceOrThrow(id);
    return { message: 'Service retrieved successfully', data: service };
  }

  async update(id: string, ownerId: string, dto: UpdateServiceDto) {
    const service = await this.findServiceOrThrow(id);
    this.assertOwnership(service.ownerId, ownerId);

    const updated = await this.prisma.service.update({ where: { id }, data: dto });
    return { message: 'Service updated successfully', data: updated };
  }

  async remove(id: string, ownerId: string) {
    const service = await this.findServiceOrThrow(id);
    this.assertOwnership(service.ownerId, ownerId);

    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service deleted successfully', data: null };
  }

  private async findServiceOrThrow(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with id "${id}" was not found.`);
    }
    return service;
  }

  private assertOwnership(ownerId: string, requesterId: string) {
    if (ownerId !== requesterId) {
      throw new ForbiddenException('You do not have permission to modify this service.');
    }
  }
}
