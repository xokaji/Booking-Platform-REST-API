import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { IsNotPastDate } from '../validators/is-not-past-date.validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty({ message: 'Customer name is required.' })
  customerName: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail({}, { message: 'A valid customer email is required.' })
  customerEmail: string;

  @ApiProperty({ example: '+94770000000' })
  @IsNotEmpty({ message: 'Customer phone is required.' })
  customerPhone: string;

  @ApiProperty({ example: '00000000-0000-0000-0000-000000000001' })
  @IsUUID('4', { message: 'serviceId must be a valid UUID.' })
  serviceId: string;

  @ApiProperty({ example: '2026-08-15', description: 'Date in YYYY-MM-DD format' })
  @IsNotEmpty({ message: 'Booking date is required.' })
  @IsNotPastDate({ message: 'Booking date cannot be in the past.' })
  bookingDate: string;

  @ApiProperty({ example: '10:00', description: 'Time in HH:mm 24-hour format' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'bookingTime must be in HH:mm format.' })
  bookingTime: string;

  @ApiPropertyOptional({ example: 'First time customer, please call before confirming.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
