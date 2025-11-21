import { z, ZodError } from 'zod';
/**
 * Middleware to validate request body using Zod schema
 */
export function validateBody(schema) {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Validation error occurred',
            });
        }
    };
}
/**
 * Middleware to validate request params using Zod schema
 */
export function validateParams(schema) {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync(req.params);
            req.params = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Invalid request parameters',
                    errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Validation error occurred',
            });
        }
    };
}
/**
 * Middleware to validate request query using Zod schema
 */
export function validateQuery(schema) {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Validation error occurred',
            });
        }
    };
}
//# sourceMappingURL=validation.js.map