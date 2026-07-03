/**
 * Environment variable validation — runs at startup.
 * In production, missing critical vars cause a hard crash with a clear message.
 * In development, warnings are logged but the app still starts.
 */

interface EnvRule {
  key: string;
  required: boolean; // true = required in all environments
  prodOnly?: boolean; // true = only required in production
  validator?: (value: string) => string | null; // return error message or null
}

const ENV_RULES: EnvRule[] = [
  {
    key: 'DATABASE_URL',
    required: true,
    validator: (v) =>
      v.startsWith('postgresql://') || v.startsWith('postgres://')
        ? null
        : 'Must be a valid PostgreSQL connection string',
  },
  {
    key: 'JWT_SECRET',
    required: true,
    validator: (v) => {
      if (v === 'dev-secret-change-me' && process.env.NODE_ENV === 'production') {
        return 'Cannot use default secret in production';
      }
      if (v.length < 32) {
        return 'Must be at least 32 characters';
      }
      return null;
    },
  },
  {
    key: 'FRONTEND_URL',
    required: false,
    validator: (v) =>
      v.startsWith('http://') || v.startsWith('https://')
        ? null
        : 'Must be a valid URL',
  },
  {
    key: 'PORT',
    required: false,
  },
  {
    key: 'NODE_ENV',
    required: false,
  },
];

export function validateEnvironment(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of ENV_RULES) {
    const value = process.env[rule.key];

    // Check required
    if (!value) {
      if (rule.required || (rule.prodOnly && isProd)) {
        errors.push(`❌ ${rule.key} is required but not set`);
      }
      continue;
    }

    // Run validator
    if (rule.validator) {
      const validationError = rule.validator(value);
      if (validationError) {
        if (isProd) {
          errors.push(`❌ ${rule.key}: ${validationError}`);
        } else {
          warnings.push(`⚠️  ${rule.key}: ${validationError}`);
        }
      }
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\n━━━ Environment Warnings ━━━');
    warnings.forEach((w) => console.warn(w));
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // In production, errors are fatal
  if (errors.length > 0) {
    console.error('\n━━━ Environment Validation Failed ━━━');
    errors.forEach((e) => console.error(e));
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (isProd) {
      process.exit(1);
    }
  }
}
