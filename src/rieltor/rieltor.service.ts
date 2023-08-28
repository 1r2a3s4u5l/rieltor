import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RieltorDto } from './dto/rieltor.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class RieltorService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(rieltorDto: RieltorDto, res: Response) {
    const candidate = await this.prismaService.rieltor.findUnique({
      where: {
        email: rieltorDto.email,
      },
    });
    if (candidate) {
      throw new BadRequestException('Bunday email mavjud');
    }
    const hashedPassword = await bcrypt.hash(rieltorDto.password, 7);
    const newUser = await this.prismaService.rieltor.create({
      data: {
        email: rieltorDto.email,
        hashedPassword,
      },
    });
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return tokens;
  }

  async signin(rieltorDto: RieltorDto, res: Response): Promise<Tokens> {
    const { email, password } = rieltorDto;

    const user = await this.prismaService.rieltor.findUnique({
      where: { email },
    });
    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return tokens;
  }

  async signout(userId: number, res: Response): Promise<boolean> {
    const user = await this.prismaService.rieltor.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
    if (!user) throw new ForbiddenException('Access Denied');
    res.clearCookie('refresh_token');
    return true;
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
    res: Response,
  ): Promise<Tokens> {
    const user = await this.prismaService.rieltor.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return tokens;
  }
  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.prismaService.rieltor.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRefreshToken,
      },
    });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
