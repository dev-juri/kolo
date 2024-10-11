import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {

  @ApiProperty({
    example: "Jane Doe",
    description: "Your full name"
  })
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({
      example: "femi@kolo.xyz",
      description: "Enter a valid email address"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
      example: "+23480909090",
      description: "Phone number with country code."
    })
    @IsPhoneNumber(null)
    phoneNumber: string;

    @ApiProperty({
      example: "Abcdv123@",
      description: "Password must contain minimum eight characters, at least one letter, one number and one special character"
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
      message: 'Minimum eight characters, at least one letter, one number and one special character'
    })
    password: string
}
