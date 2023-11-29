import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserInformation, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  private readonly INDEX_NAME = 'users';
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject('ELASTIC_SEARCH')
    private elasticClient: Client,
  ) {}

  async findById(userId: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async insert(user: User): Promise<void> {
    await this.userRepository.insert(user);
  }

  async update(user: User): Promise<void> {
    await this.userRepository.update({ id: user.id }, user);
  }

  /**
   * User Information store in Elasticsearch
   */
  async saveInformation(user: IUserInformation): Promise<void> {
    const { id, ...othField } = user;
    await this.elasticClient.index({
      index: this.INDEX_NAME,
      id: id,
      document: othField,
    });
  }

  async findInformationById(userId: string): Promise<IUserInformation> {
    const user = await this.elasticClient.get<IUserInformation>({
      index: this.INDEX_NAME,
      id: userId,
    });
    return user._source;
  }
  /**
   * End of User Information store in Elasticsearch
   */
}
