import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { QueryBookingDto } from './dto/query-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
    if (!service) {
      throw new NotFoundException(`Service with id "${dto.serviceId}" was not found.`);
    }
    if (!service.isActive) {
      throw new BadRequestException('This service is not currently accepting bookings.');
    }

    try {
      const booking = await this.prisma.booking.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          serviceId: dto.serviceId,
          bookingDate: new Date(dto.bookingDate),
          bookingTime: dto.bookingTime,
          notes: dto.notes,
          status: BookingStatus.PENDING,
        },
      });
      return { message: 'Booking created successfully', data: booking };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          'A booking already exists for this service at the selected date and time.',
        );
      }
      throw error;
    }
  }

  async findAll(query: QueryBookingDto) {
    const { page = 1, limit = 10, status, search, serviceId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      ...(status ? { status } : {}),
      ...(serviceId ? { serviceId } : {}),
      ...(search
        ? {
            OR: [
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerEmail: { contains: search, mode: 'insensitive' } },
              { customerPhone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { service: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      message: 'Bookings retrieved successfully',
      data: { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    };
  }

  async findOne(id: string) {
    const booking = await this.findBookingOrThrow(id);
    return { message: 'Booking retrieved successfully', data: booking };
  }


  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.findBookingOrThrow(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('A cancelled booking cannot change status.');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
    });
    return { message: 'Booking status updated successfully', data: updated };
  }

  async cancel(id: string) {
    const booking = await this.findBookingOrThrow(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('This booking is already cancelled.');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('A completed booking cannot be cancelled.');
    }

    const cancelled = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
    return { message: 'Booking cancelled successfully', data: cancelled };
  }

  private async findBookingOrThrow(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" was not found.`);
    }
    return booking;
  }
}
