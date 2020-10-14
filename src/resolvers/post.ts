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
import { Like } from "../entities/Like";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async toggleLike(
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session!.userId;

    const like = await Like.findOne({ userId, postId });
    //user did not like this post in the past
    if (!like) {
      await getConnection().query(
        `
        START TRANSACTION;
  
        insert into "like" ("userId", "postId")
        values (${userId},${postId});
  
        update post
        set "likesCount" = "likesCount" + 1
        where id = ${postId};

        COMMIT;
      `
      );
      //user already liked this post => unlike now
    } else {
      await getConnection().query(
        `
        START TRANSACTION;
  
        delete from "like" 
        where "userId"=${userId} and "postId"=${postId};
  
        update post
        set "likesCount" = "likesCount" - 1
        where id = ${postId};

        COMMIT;
      `
      );
    }

    return true;
  }

  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.length <= 200
      ? post.text
      : post.text.slice(0, 200) + "...";
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null, //timestamp as string (too large num to pass as int)
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(limit, 100);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (req.session!.userId) {
      replacements.push(req.session!.userId);
    }

    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }

    const posts = await getConnection().query(
      `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
      ) creator,
      ${
        req.session!.userId
          ? '(select count(*) != 0 from "like" where "userId" = $2 and "postId" = p.id) "hasLiked"'
          : 'false as "hasLiked"'
      }
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );

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
