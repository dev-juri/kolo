import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { JoinFamilyDto } from '../dto/update-family.dto';
import { Family } from '../entities/family.entity';
import { UsersService } from 'src/users/providers/users.service';
import { generateString } from 'src/constants';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family) private familyRepo: Repository<Family>,
    private readonly usersService: UsersService,
  ) {}

  async createFamily(dto: CreateFamilyDto, userId: number): Promise<Family> {
    const family = this.familyRepo.create(dto);
    const user = await this.usersService.findUser(userId);
    if (!user) throw new NotFoundException('User not found');

    let familyCode = await this.generateCode();
    family.familyCode = familyCode;

    if (user.family)
      throw new ForbiddenException('User is already part of a family');
    family.users = [user];
    family.ownerId = userId;
    await this.familyRepo.save(family);

    return family;
  }

  async joinFamily(dto: JoinFamilyDto, userId: number): Promise<Family> {
    const family = await this.familyRepo.findOne({
      where: { familyCode: dto.familyCode },
    });
    if (!family) throw new NotFoundException('Family not found');

    const user = await this.usersService.findUser(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.family)
      throw new ForbiddenException('User is already part of a family');

    user.family = family;
    await this.usersService.updateUser(user);

    return family;
  }

  async findFamily(familyId: number) {
    let family = undefined;

    try {
      family = await this.familyRepo.findOne({
        where: {
          id: familyId,
        },
        relations: {
          transactions: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }
    return family;
  }

  async generateCode(): Promise<string> {
    let familyCode = generateString(5);

    try {
      let family = await this.familyRepo.findOne({
        where: { familyCode: familyCode },
      });
      if (family) {
        this.generateCode();
      }
    } catch (error) {}

    return familyCode;
  }

  
  async updateFamilyBalance(amount: number, familyId: number) {
    let family = undefined;

    try {
      family = await this.familyRepo.findOne({
        where: {
          id: familyId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to connect to the database',
      );
    }
    family.balance = Number(family.balance) + Number(amount);

    return await this.familyRepo.save(family);
  }
}
