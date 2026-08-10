import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerDto);
    const accessToken = await this.generateToken(user);
    return new AuthResponseDto(user, accessToken);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const userInDb = await this.usersService.findByEmail(email);
    if (!userInDb) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, userInDb.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _, ...sanitizedUser } = userInDb;
    const userResponse = new UserResponseDto(sanitizedUser);
    const accessToken = await this.generateToken(userResponse);

    return new AuthResponseDto(userResponse, accessToken);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.usersService.findById(userId);
  }

  private async generateToken(user: UserResponseDto): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
