import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserStatus } from '@admin/access/users/user-status.enum';
import { UserEntity } from '@admin/access/users/user.entity';
import { AuthCredentialsRequestDto, LoginResponseDto, JwtPayload } from '../dtos';
import { UserMapper } from '@admin/access/users/users.mapper';
import { TokenService } from './token.service';
import { RedisService } from '@database/redis-cache.service';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';
import { HashHelper } from '@helpers';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private tokenService: TokenService,
    private redisService: RedisService,
  ) {}

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({ username, password, uuid, code }: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
    const codetext = await this.redisService.getValue(uuid);
    if (!codetext) {
      throw new HttpException(
        {
          status: HttpStatus.CREATED,
          message: '验证码超时',
        },
        HttpStatus.CREATED,
      );
    }
    if (codetext != code) {
      throw new HttpException(
        {
          status: HttpStatus.CREATED,
          message: '验证码错误',
        },
        HttpStatus.CREATED,
      );
    }
    const user: UserEntity = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'r', 'r.active = true')
      .leftJoinAndSelect('r.permissions', 'rp', 'rp.active = true')
      .leftJoinAndSelect('u.permissions', 'p', 'p.active = true')
      .where('u.username = :username', { username })
      .getOne();

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.CREATED,
          message: '用户不存在',
        },
        HttpStatus.CREATED,
      );
    }
    const passwordMatch = await HashHelper.compare(password, user.password);
    if (!passwordMatch) {
      throw new HttpException(
        {
          status: HttpStatus.CREATED,
          message: '密码错误',
        },
        HttpStatus.CREATED,
      );
    }
    if (user.status == UserStatus.Blocked) {
      throw new HttpException(
        {
          status: HttpStatus.CREATED,
          message: '该用户已登录',
        },
        HttpStatus.CREATED,
      );
    }
    if (user.status == UserStatus.Inactive) {
      throw new HttpException(
        {
          status: HttpStatus.CREATED,
          message: '该用户已被禁用',
        },
        HttpStatus.CREATED,
      );
    }
    const payload: JwtPayload = { id: user.id, username: user.username };
    const token = this.tokenService.generateAuthToken(payload);
    const userDto = await UserMapper.toDto(user);
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user);
    const additionalPermissions = permissions.map(({ slug }) => slug);
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => slug);
      return {
        name,
        permissions: rolePermissions,
      };
    });
    return {
      token,
    };
  }
  public async getCodeImg() {
    const operators = ['+', '*']; // 只包含加法和减法
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const uuid = uuidv4();
    const { text, data } = svgCaptcha.createMathExpr({
      mathMin: 1,
      mathMax: 2,
      mathOperator: operator,
      width: 115,
      height: 40,
    });
    await this.redisService.setValue(uuid, text, 30);
    return {
      img: data,
      uuid: uuid,
    };
  }
}
