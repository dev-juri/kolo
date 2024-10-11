import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: "femi@kolo.xyz",
    description: "Enter a valid email address"
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Abcdv123@",
    description: "Password must contain minimum eight characters, at least one letter, one number and one special character"
  })
  @IsString()
  password: string;
}