import { isAuth } from "../middleware/isAuth";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  UseMiddleware,
  Ctx,
  Int,
  Root,
  FieldResolver,
  ObjectType,
  Field,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { getConnection } from "typeorm";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.length <= 200
      ? post.text
      : post.text.slice(0, 200) + "...";
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null //timestamp as string (too large num to pass as int)
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(limit, 100);
    const realLimitPlusOne = realLimit + 1;
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("posts")
      .orderBy('"createdAt"', "DESC")
      .take(realLimitPlusOne);
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) }); //if cursor == p1.createdAt => get posts older than p1 (p1 not included)
    }

    const posts = await qb.getMany();
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ text, creatorId: req.session!.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("text", () => String, { nullable: true }) text: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof text !== "undefined") {
      await Post.update({ id }, { text });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
