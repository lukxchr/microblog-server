import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { Tag } from "./Tag";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  likesCount!: number;

  @Field()
  hasLiked: boolean; //shows if current user already liked the post

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field(() => [Tag])
  @ManyToMany(() => Tag, (tag) => tag.posts)
  tags: Tag[];

  //@Field(() => [Tag])
  // @OneToMany(() => Tag, (tag) => tag.posts)
  // tags: Tag[];

  // @Field(() => [Tag])
  // @ManyToMany(() => Tag, (tag) => tag.posts)
  // tags: Tag[];
}
