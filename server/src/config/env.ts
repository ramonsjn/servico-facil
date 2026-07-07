import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "fallback-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "fallback-refresh-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3001",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  uploadMaxSize: Number(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024,
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

