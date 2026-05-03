import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateBrandDto {
    @IsString()
    @IsOptional()
    brandName: string;
    @IsString()
    @IsOptional()
    brandImage: string;
    @IsString()
    @IsOptional()
    brandDesc: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    productId: string[] | undefined;
}