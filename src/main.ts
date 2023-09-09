import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common'; // ValidationPipe 是一个内置的管道，用于处理和验证传入请求的数据
import { HttpResponseInterceptor, HttpExceptionFilter } from '@common/http';
import * as compression from 'compression'; //  压缩
import { AppModule } from './app.module';
import { SwaggerConfig } from '@config';
import rateLimit from 'express-rate-limit'; // 请求频率限制
import helmet from 'helmet'; // 通过设置header中的参数来提供一些安全机制

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.use(helmet()); //安全header
  app.use(compression()); //压缩
  app.enableCors(); // 浏览器同源策略设置
  app.enableVersioning(); // 版本控制
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 100 requests per windowMs
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter()); // 全局捕获每个未处理的异常
  app.useGlobalInterceptors(new HttpResponseInterceptor()); // 全局拦截器在客户端请求和服务器路由之间作用
  app.useGlobalPipes(new ValidationPipe()); // 全局数据格式验证

  app.setGlobalPrefix(AppModule.apiPrefix); // 为所有的路由添加前缀
  SwaggerConfig(app, AppModule.apiVersion);
  await app.listen(AppModule.port);
  return AppModule.port;
};

bootstrap().then((port: number) => {
  Logger.log(`Application running on port: ${port}`, 'Main');
});
