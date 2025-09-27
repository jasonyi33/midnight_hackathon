import { z } from 'zod';

export const connectWalletSchema = z.object({
  body: z.object({
    walletAddress: z.string().regex(/^[a-zA-Z0-9_]+$/),
    signature: z.string(),
    message: z.string()
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
});

export type ConnectWalletInput = z.infer<typeof connectWalletSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];