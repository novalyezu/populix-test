import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ length: 255 })
  id: string;

  @Column({ length: 255, nullable: false, unique: true })
  username: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 255, nullable: true })
  profilePicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export interface IUserInformation {
  id: string;
  fullname: string;
  description: string;
  phoneNumber: string;
}
