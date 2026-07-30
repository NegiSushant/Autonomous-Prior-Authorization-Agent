import { z } from "zod";

export const CreateUserSchema = z.object({
  //   email: z.string().min(3).max(20),
  email: z.string(),
  password: z.string().min(8),
  name: z.string(),
});

export const SignInSchema = z.object({
  email: z.string().min(3).max(20),
  password: z.string().min(8),
});
