import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
  Resolver,
  Query,
  Arg,
  Int,
  UseMiddleware,
  Mutation,
  Ctx,
} from "type-graphql";
import { Comment } from "../entities/Comment";

@Resolver()
export class CommentResolver {
  @Query(() => [Comment])
  async comments(@Arg("postId", () => Int) postId: number) {
    return await Comment.find({ where: { postId }, relations: ["user"] });
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("text") text: string,
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    return Comment.create({ text, postId, userId: req.session!.userId }).save();
  }

  @Mutation(() => Comment, { nullable: true })
  async updateComment(
    @Arg("id") id: number,
    @Arg("text", () => String, { nullable: true }) text: string
  ): Promise<Comment | null> {
    const comment = await Comment.findOne(id);
    if (!comment) {
      return null;
    }
    if (typeof text !== "undefined") {
      //await Comment.update({ id }, { text });
      comment.text = text;
      await comment.save();
    }
    return comment;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const userId = req.session!.userId;
    const comment = await Comment.findOne(id);
    if (!comment) {
      return false;
    }
    if (userId != comment.userId) {
      return false;
    }
    await Comment.delete(id);
    return true;
  }
}
