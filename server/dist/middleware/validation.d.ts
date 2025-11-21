import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
/**
 * Middleware to validate request body using Zod schema
 */
export declare function validateBody<T extends z.ZodTypeAny>(schema: T): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to validate request params using Zod schema
 */
export declare function validateParams<T extends z.ZodTypeAny>(schema: T): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to validate request query using Zod schema
 */
export declare function validateQuery<T extends z.ZodTypeAny>(schema: T): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.d.ts.map