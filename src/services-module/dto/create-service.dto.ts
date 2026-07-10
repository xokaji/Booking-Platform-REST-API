import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Classic Haircut' })
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @ApiProperty({ example: 'A precision haircut tailored to your style.' })
  @IsNotEmpty({ message: 'Description is required.' })
  description: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @IsInt({ message: 'Duration must be an integer number of minutes.' })
  @IsPositive({ message: 'Duration must be greater than zero.' })
  duration: number;

  @ApiProperty({ example: 25.0 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid monetary amount.' })
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
