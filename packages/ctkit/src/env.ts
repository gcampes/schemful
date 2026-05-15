import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment validation schema
const envSchema = z.object({
  CONTENTFUL_MANAGEMENT_TOKEN: z
    .string()
    .min(1, "Contentful Management Token is required"),
  CONTENTFUL_SPACE_ID: z.string().min(1, "Contentful Space ID is required"),
  CONTENTFUL_ENVIRONMENT_ID: z
    .string()
    .min(1, "Contentful Environment ID is required")
    .default("master"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

// Lazy validation — only runs when env is first accessed
let _env: Env | null = null;

function getEnv(): Env {
  if (_env) return _env;

  try {
    _env = envSchema.parse({
      CONTENTFUL_MANAGEMENT_TOKEN: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
      CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
      CONTENTFUL_ENVIRONMENT_ID:
        process.env.CONTENTFUL_ENVIRONMENT_ID || "master",
      NODE_ENV: process.env.NODE_ENV || "development",
    });
    return _env;
  } catch (error: unknown) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Proxy that lazily validates on first property access
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
