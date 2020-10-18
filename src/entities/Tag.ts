import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Tag extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  // @Field()
  // @Column()
  // postId: number;

  // @OneToMany(() => Post, (post) => post.tags)
  // posts: Post[];

  @Field()
  @Column()
  name!: string;

  @ManyToMany(() => Post, (post) => post.tags, {
    onDelete: "CASCADE",
    cascade: true,
  })
  @JoinTable()
  posts: Post[];
}
