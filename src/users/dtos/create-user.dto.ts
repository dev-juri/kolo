import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    email: string;

    @IsPhoneNumber(null)
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
      message: 'Minimum eight characters, at least one letter, one number and one special character'
    })
    password: string
}
