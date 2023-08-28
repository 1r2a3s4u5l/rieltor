import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RieltorService } from './rieltor.service';
import { RieltorDto } from './dto';
import { Tokens } from './types';
import { Response } from 'express';
import { GetCurrentUser, GetCurrentUserId, Public } from '../common/decorators';
import { RefreshTokenGuard } from '../common/guards';

@Controller('rieltor')
export class RieltorController {
  constructor(private readonly rieltorService: RieltorService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() rieltorDto: RieltorDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    console.log(1);

    return this.rieltorService.signup(rieltorDto, res);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() rieltorDto: RieltorDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    return this.rieltorService.signin(rieltorDto, res);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Boolean> {
    return this.rieltorService.signout(userId, res);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshtoken(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    return this.rieltorService.refreshTokens(userId, refreshToken, res);
  }
}
