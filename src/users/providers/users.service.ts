import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject userRepository
     */
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    /**
     * Inject ConfigService
     */
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    let { email, phoneNumber } = createUserDto;
    email = email.toLowerCase();

    const userExists = await this.usersRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (userExists) throw new BadRequestException('User already exists');

    const newUser = this.usersRepository.create(createUserDto);
    try {
      await this.usersRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }
    delete newUser.password;

    return {
      message: 'User account created successfully.',
      data: newUser,
      statusCode: HttpStatus.CREATED,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    let { email, password } = loginUserDto;
    email = email.toLowerCase();

    let user = undefined;

    try {
      user = await this.usersRepository.findOne({
        where: { email: email },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    delete user.password;

    return {
      message: 'Login successful',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  async findUser(userId: number): Promise<User> | null {
    let user = undefined;

    try {
      user = await this.usersRepository.findOne({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }

    if (user) delete user.password;
    return user;
  }

  async updateUser(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }
}
