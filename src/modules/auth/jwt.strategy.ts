import { UserStatus } from '@admin/access/users/user-status.enum';
import { UserEntity } from '@admin/access/users/user.entity';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from './dtos';
import { DisabledUserException, InvalidCredentialsException } from '@common/http/exceptions';
import { ErrorType } from '@common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private consigService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: consigService.get('TOKEN_SECRET'),
    });
  }

  async validate({ username }: JwtPayload): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository
    .createQueryBuilder('u')
    .leftJoinAndSelect('u.roles', 'r', 'r.active = true')
    .leftJoinAndSelect('r.permissions', 'rp', 'rp.active = true')
    .leftJoinAndSelect('u.permissions', 'p', 'p.active = true')
    .where('u.username = :username', { username })
    .getOne();
    if (!user) {
      throw new InvalidCredentialsException();
    }
    if (user.status == UserStatus.Inactive) {
      throw new DisabledUserException(ErrorType.InactiveUser);
    }
    if (user.status == UserStatus.Blocked) {
      throw new DisabledUserException(ErrorType.BlockedUser);
    }
    return user;
  }
}
