import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ConfigModule], //forFeature方法在具体的功能模块中定义和注册特定的实体或仓库
  controllers: [UsersController],
  providers: [UsersService, JwtService, ConfigService],
  exports: [JwtService],
})
export class UsersModule {}
