import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError"; 

export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        new AppError(
          result.error.issues
            .map(issue => issue.message)
            .join(", "),
          400
        )
      );
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      res.locals.validatedData = {
        ...res.locals.validatedData,
        [source]: result.data
      };
    }

    next();
  };
};