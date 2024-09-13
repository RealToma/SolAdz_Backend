import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './users.dto';

@Controller('users')
export class UsersController {
    constructor(
        private userService: UsersService
    ){}

    @HttpCode(HttpStatus.OK)
    @Post()
    async createUser (@Body() data: CreateUserDto) {
        const user = await this.userService.create(data);
        return user;
    }

    @HttpCode(HttpStatus.OK)
    @Get('commission/txn/:address')
    async getClaimCommissionTxn (@Param('address') address: string) {
        const txn = await this.userService.withdrawCommission(address);
        return txn;
    }

    @HttpCode(HttpStatus.OK)
    @Get('commission/:address')
    async getCommission(@Param('address') address: string) {
        const res = await this.userService.getCommission(address);
        return res;
    }

    @HttpCode(HttpStatus.OK)
    @Get(':address')
    async getUser(@Param('address') address: string) {
        
    }
}
