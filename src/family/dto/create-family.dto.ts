import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFamilyDto {

  @ApiProperty({
    example: "The Marvels",
    description: "Enter the family name"
  })
    @IsString()
    @IsNotEmpty()
    name: string;
  }
