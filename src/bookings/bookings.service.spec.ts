import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: {
    service: { findUnique: jest.Mock };
    booking: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      service: { findUnique: jest.fn() },
      booking: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('create', () => {
    it('throws NotFoundException when the referenced service does not exist', async () => {
      prisma.service.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          customerName: 'John',
          customerEmail: 'john@example.com',
          customerPhone: '+94770000000',
          serviceId: 'missing-service',
          bookingDate: '2099-01-01',
          bookingTime: '10:00',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when the service is inactive', async () => {
      prisma.service.findUnique.mockResolvedValue({ id: 's1', isActive: false });

      await expect(
        service.create({
          customerName: 'John',
          customerEmail: 'john@example.com',
          customerPhone: '+94770000000',
          serviceId: 's1',
          bookingDate: '2099-01-01',
          bookingTime: '10:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('prevents a CANCELLED booking from being updated to COMPLETED', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 'b1', status: BookingStatus.CANCELLED });

      await expect(service.updateStatus('b1', { status: BookingStatus.COMPLETED })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows a PENDING booking to move to CONFIRMED', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 'b1', status: BookingStatus.PENDING });
      prisma.booking.update.mockResolvedValue({ id: 'b1', status: BookingStatus.CONFIRMED });

      const result = await service.updateStatus('b1', { status: BookingStatus.CONFIRMED });
      expect(result.data.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  describe('cancel', () => {
    it('throws when trying to cancel an already completed booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({ id: 'b1', status: BookingStatus.COMPLETED });

      await expect(service.cancel('b1')).rejects.toThrow(BadRequestException);
    });
  });
});
