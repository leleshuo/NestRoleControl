<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## 关于一些概念

### exception

在 NestJS 中，HttpException 类是内建的一部分异常类之一。它继承自 JavaScript 的原生 Error 类并添加了一些额外的方法和属性。
以下是 HttpException 中的一些主要方法：
getStatus()：此方法返回 HTTP 状态码。例如，如果你的异常是 new BadRequestException()，那么 exception.getStatus() 将返回 400。
getResponse()：此方法返回由构造函数传入的响应对象，或者一个默认的包含错误消息和状态码的对象。例如，如果你的异常是 new HttpException('Invalid request', 400)，那么 exception.getResponse() 将返回 'Invalid request' 字符串。

### ValidationPipe

ValidationPipe 是一个验证参数的工具，该工具必须通过 dto 的方式定义参数类型

### forRoot

forRoot() 方法接收一个可选的配置对象参数，通过这个参数你可以定制 ConfigModule 的行为，这个配置对象的属性包括：

envFilePath：一个 .env 文件或文件数组的字符串路径。这是你存储环境变量的地方。默认值为 '.env'。

ignoreEnvFile：如果设置为 true，那么将不会加载 .env 文件。这在生产环境中很有用，因为在这种情况下，环境变量通常直接在环境中设置，而不是从 .env 文件中加载。

validationSchema：一个 Joi 对象，用于验证环境变量。

validate：一个验证函数，用于验证和转换环境变量。

load：一个你想要导入的自定义配置文件数组。

isGlobal：如果设置为 true，则将 ConfigService 注册为全局服务，使其能够在任何地方注入使用，而不需要导入 ConfigModule。

### dto用途

1、验证输入：你可以使用类验证器（如 class-validator）来确保接收到的数据符合预期格式。例如，如果你期望一个字段是字符串并且长度在 3 到 50 个字符之间，你可以在 DTO 类中使用相应的装饰器来完成这种验证。
2、转换输出：你可以使用 DTO 来确定响应中应包含哪些字段以及这些字段的结构。这使得你可以很容易地调整 API 的响应格式，而无需修改实体类或服务代码。
3、自动文档生成：如果你使用了像 Swagger 这样的工具，那么 DTO 类还可以帮助你自动生成 API 文档。
