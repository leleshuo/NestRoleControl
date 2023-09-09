import { UserEntity } from '@admin/access/users/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard, PermissionsGuard } from './guards'; // 权限验证
import { TokenService, AuthService } from './services';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core'; // 注册为全局守卫，所有的路由都需要通过守卫放行
import { Module } from '@nestjs/common';
import { RedisCacheModule } from '@database/redis-cache.module'; // redis模块
import { JwtModule } from '@nestjs/jwt';
// providers 和 exports 一起允许你创建共享模块，即其提供者可以在应用程序的多个部分中共享和复用。
@Module({
  imports: [
    ConfigModule,
    RedisCacheModule,
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('TOKEN_SECRET'),
        signOptions: {
          expiresIn: config.get('ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ], // 一个数组，列出了当前模块所依赖的其他模块。这些模块的提供者会被添加到当前模块的依赖注入系统中。
  controllers: [AuthController], // 一个数组，定义了一组将被此模块实例化的控制器
  providers: [
    AuthService,
    JwtStrategy,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ], // 一个数组，定义了一组将被 Nest 的注入器实例化并且可以在该模块中通过依赖注入访问的提供者（通常是服务）
  exports: [JwtStrategy, PassportModule, TokenService, AuthService], // 一个数组，定义了一组在其他模块中使用的提供者。只有被导出的提供者才能在其他模块中可见和可用。
})
export class AuthModule {}
