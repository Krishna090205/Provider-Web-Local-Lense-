import { toNestErrors } from '@hookform/resolvers';
import { Resolver, FieldValues, ResolverOptions } from 'react-hook-form';
import { z } from 'zod';

/**
 * Universal safe Zod resolver compatible with both Zod v3 (err.errors) and Zod v4 (err.issues).
 * Completely eliminates "Uncaught (in promise) ZodError" caused by @hookform/resolvers/zod expecting v3 err.errors.
 */
export function zodResolver<T extends z.ZodType<any, any, any>>(
  schema: T
): Resolver<z.infer<T> & FieldValues> {
  return async (values: any, _context: any, options: ResolverOptions<any>) => {
    try {
      const result = await schema.safeParseAsync(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }

      const issues = result.error.issues || (result.error as any).errors || [];

      // Log validation issues in development only without exposing personal data or secrets
      if (import.meta.env.DEV) {
        console.warn(
          'Zod validation issues:',
          issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
            expected: issue.expected,
            received: issue.received,
          }))
        );
      }

      const errors: Record<string, any> = {};

      for (const issue of issues) {
        const path = issue.path.join('.') || 'root';
        if (!errors[path]) {
          errors[path] = {
            type: issue.code,
            message: issue.message,
          };
        }
      }

      return {
        values: {},
        errors: toNestErrors(errors, options),
      };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && ('issues' in err || 'errors' in err)) {
        const issues = (err as any).issues || (err as any).errors || [];
        const errors: Record<string, any> = {};
        for (const issue of issues) {
          const path = issue.path?.join('.') || 'root';
          if (!errors[path]) {
            errors[path] = {
              type: issue.code,
              message: issue.message,
            };
          }
        }
        return {
          values: {},
          errors: toNestErrors(errors, options),
        };
      }
      return {
        values: {},
        errors: {
          root: {
            type: 'validation',
            message: err instanceof Error ? err.message : 'Validation error',
          },
        } as any,
      };
    }
  };
}
