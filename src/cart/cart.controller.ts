import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller('cart')
export class CartController{
    constructor(private readonly cartService: CartService){}

}