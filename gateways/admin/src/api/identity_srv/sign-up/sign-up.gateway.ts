// import { JwtService } from '@nestjs/jwt';
// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
//
// import { createHmac } from 'crypto';
// import { AxiosResponse } from 'axios';
// import { firstValueFrom, map } from 'rxjs';
//
// import { SignUpDto } from './dto/sign-up.dto';
//
// @Injectable()
// export class SignUpGateway {
//   constructor(
//     private readonly config: ConfigService,
//     private readonly jwtService: JwtService,
//     private readonly httpService: HttpService,
//   ) {}
//
//   public hashPassword(password: string) {
//     const md5Hash = createHmac('sha512', this.config.get('PASSWORD_SALT'));
//     return md5Hash.update(password).digest('hex');
//   }
//
//   async signUp(credentials: SignUpDto) {
//     const request = this.httpService
//       .post(
//         '/auth/sign-up',
//         {
//           login: credentials.login,
//           password: this.hashPassword(credentials.password),
//         },
//         {
//           baseURL: this.config.get('API_IDENTITY_SRV'),
//         },
//       )
//       .pipe(map((res) => res.data));
//
//     return await firstValueFrom(request);
//   }
// }
