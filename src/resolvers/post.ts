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
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { getConnection } from "typeorm";

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.length <= 200
      ? post.text
      : post.text.slice(0, 200) + "...";
  }

  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null //timestamp as string (too large num to pass as int)
  ): Promise<Post[]> {
    const realLimit = Math.min(limit, 50);
    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("posts")
      .orderBy('"createdAt"', "DESC")
      .take(realLimit);
    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) }); //if cursor == p1.createdAt => get posts older than p1 (p1 not included)
    }
    return qb.getMany();
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
