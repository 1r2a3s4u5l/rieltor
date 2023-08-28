import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RieltorDto {
    @IsEmail()
    readonly email:string

    @IsNotEmpty()
    @IsString()
    readonly password:string
}
