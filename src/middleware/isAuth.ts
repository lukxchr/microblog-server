import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";

//runs before resolver
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session?.userId) {
    throw new Error("you need to log in");
  }

  return next();
};
