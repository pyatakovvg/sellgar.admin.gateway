// import { Module } from '@nestjs/common';
// import { JwtService, JwtModule } from '@nestjs/jwt';
//
// import { AccessTokenStrategy } from './strategies/access-token.strategy';
//
// import { SignUpService } from './sign-up.service';
// import { SignUpGateway } from './sign-up.gateway';
//
// @Module({
//   imports: [
//     JwtModule.register({
//       global: true,
//       secret: 'secretKey',
//       signOptions: { expiresIn: '60s' },
//     }),
//   ],
//   providers: [SignUpService, SignUpGateway, JwtService, AccessTokenStrategy],
//   controllers: [SignUpController],
//   exports: [SignUpService],
// })
// export class SignUpModule {}
