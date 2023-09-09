import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthCredentialsRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'jDoe',
  })
  readonly username: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'Hello123',
  })
  readonly password: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '61e0cb6d-c502-4be8-8681-ba8f3de6b08f',
  })
  readonly uuid: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '1',
  })
  readonly code: string;
}
