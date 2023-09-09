import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Setup default connection in the application
 * @param config {ConfigService}
 */
const defaultConnection = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get('TYPEORM_HOST'),
  port: config.get('TYPEORM_PORT'),
  username: config.get('TYPEORM_USERNAME'),
  password: config.get('TYPEORM_PASSWORD'),
  database: config.get('TYPEORM_DATABASE'),
  entities: ['compile/modules/**/*.entity{.ts,.js}'], // 自动识别并加载所有@Entity() 装饰器的表结构
  synchronize: config.get('TYPEORM_SYNCHRONIZE') == 'true', // 每次应用启动会自动同步所有的数据库表结构，生产环境不建议使用
  logging: config.get('TYPEORM_LOGGING') == 'true', // 打印数据库操作日志记录到终端显示，生产环境如果有需要可以将这个日志记录到某个文件中
});

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule], // 导入 ConfigModule 以供 forRootAsync 使用
    inject: [ConfigService], // 可以在下面的工厂函数中注入 ConfigService
    useFactory: defaultConnection,
  }),
];
