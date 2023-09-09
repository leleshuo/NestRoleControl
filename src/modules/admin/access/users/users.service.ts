import { InternalServerErrorException, RequestTimeoutException, NotFoundException, Injectable } from '@nestjs/common';
import { ChangePasswordRequestDto, CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from './dtos';
import {
  InvalidCurrentPasswordException,
  ForeignKeyConflictException,
  UserExistsException,
} from '@common/http/exceptions';
import { Pagination, PaginationRequest, PaginationResponseDto } from '@libs/pagination';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DBErrorCode } from '@common/enums';
import { UserMapper } from './users.mapper';
import { HashHelper } from '@helpers';
import { TimeoutError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Get a paginated user list
   * @param pagination {PaginationRequest}
   * @returns {Promise<PaginationResponseDto<UserResponseDto>>}
   */
  public async getUsers(pagination: PaginationRequest): Promise<PaginationResponseDto<UserResponseDto>> {
    try {
      const {
        skip,
        limit: take,
        order,
        params: { search },
      } = pagination;
      const query = this.usersRepository
        .createQueryBuilder('u')
        .innerJoinAndSelect('u.roles', 'r')
        .leftJoinAndSelect('u.permissions', 'p')
        .skip(skip)
        .take(take)
        .orderBy(order);

      if (search) {
        query.where(
          `
              u.username ILIKE :search
              OR u.first_name ILIKE :search
              OR u.last_name ILIKE :search
              `,
          { search: `%${search}%` },
        );
      }
      const [userEntities, totalUsers] = await query.getManyAndCount();
      const UserDtos = await Promise.all(userEntities.map(UserMapper.toDtoWithRelations));
      return Pagination.of(pagination, totalUsers, UserDtos);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  public async getUserInfo(token: string) {
    try {
      const { id } = this.jwtService.verify(token, { secret: this.configService.get('TOKEN_SECRET') });
      const userEntity = await this.usersRepository.findOne({
        where: { id: id },
        relations: ['permissions', 'roles'],
      });
      if (!userEntity) {
        throw new NotFoundException();
      }
      const dto = UserMapper.toDtoWithRelations(userEntity);
      let permissions: Array<any> = (await dto).permissions;
      if ((await dto).isSuperUser) {
        permissions = ['*:*:*'];
      }
      const response = { users: (await dto), roles: (await dto).roles, permissions: permissions };
      return response;
    } catch (error) {
      console.log('🚀 ~ file: users.service.ts:61 ~ UsersService ~ getUserInfo ~ error:', error);
    }
  }
  /**
   * Get user by id
   * @param id {string}
   * @returns {Promise<UserResponseDto>}
   */
  public async getUserById(id: string): Promise<UserResponseDto> {
    const userEntity = await this.usersRepository.findOne({ where: { id: id }, relations: ['permissions', 'roles'] });
    if (!userEntity) {
      throw new NotFoundException();
    }

    return UserMapper.toDtoWithRelations(userEntity);
  }

  /**
   * Create new user
   * @param userDto {CreateUserRequestDto}
   * @returns {Promise<UserResponseDto>}
   */
  public async createUser(userDto: CreateUserRequestDto): Promise<UserResponseDto> {
    try {
      let userEntity = UserMapper.toCreateEntity(userDto);
      userEntity.password = await HashHelper.encrypt(userEntity.password);
      userEntity = await this.usersRepository.save(userEntity);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new UserExistsException(userDto.username);
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new ForeignKeyConflictException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Update User by id
   * @param id {string}
   * @param userDto {UpdateUserRequestDto}
   * @returns {Promise<UserResponseDto>}
   */
  public async updateUser(id: string, userDto: UpdateUserRequestDto): Promise<UserResponseDto> {
    let userEntity = await this.usersRepository.findOne({ where: { id: id } });
    if (!userEntity) {
      throw new NotFoundException();
    }

    try {
      userEntity = UserMapper.toUpdateEntity(userEntity, userDto);
      userEntity = await this.usersRepository.save(userEntity);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new UserExistsException(userDto.username);
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new ForeignKeyConflictException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Change user password
   * @param changePassword {ChangePasswordRequestDto}
   * @param user {string}
   * @returns {Promise<UserResponseDto>}
   */
  public async changePassword(changePassword: ChangePasswordRequestDto, userId: string): Promise<UserResponseDto> {
    const { currentPassword, newPassword } = changePassword;

    const userEntity = await this.usersRepository.findOne({ where: { id: userId } });

    if (!userEntity) {
      throw new NotFoundException();
    }

    const passwordMatch = await HashHelper.compare(currentPassword, userEntity.password);

    if (!passwordMatch) {
      throw new InvalidCurrentPasswordException();
    }

    try {
      userEntity.password = await HashHelper.encrypt(newPassword);
      await this.usersRepository.save(userEntity);
      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
