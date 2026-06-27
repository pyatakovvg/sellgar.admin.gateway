type EnvConfig = Record<string, unknown>;

const requiredStringKeys = [
  'ORIGINS',
  'AUTH_COOKIE',
  'AUTH_COOKIE_SAME_SITE',
  'PASSWORD_SALT',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'FINGERPRINT_SECRET',
  'AMQP_HOSTNAME',
  'AMQP_USERNAME',
  'AMQP_PASSWORD',
  'AMQP_PRODUCT_SRV_COMMAND_QUEUE',
  'AMQP_IDENTITY_SRV_COMMAND_QUEUE',
  'AMQP_ADMIN_GATEWAY_PRODUCT_SRV_EVENT_QUEUE',
  'AMQP_PRODUCT_SRV_EXCHANGE',
  'API_FILE_SRV',
  'API_PRODUCT_SRV',
];

const requiredNumberKeys = ['PORT', 'AUTH_COOKIE_EXTEND', 'AMQP_PORT'];

const requiredBooleanKeys = ['AUTH_COOKIE_SECURE'];

function requireString(config: EnvConfig, key: string): string {
  const value = config[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
}

function requireNumber(config: EnvConfig, key: string): number {
  const value = config[key];
  const numberValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return numberValue;
}

function requireBoolean(config: EnvConfig, key: string): boolean {
  const value = config[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Environment variable ${key} must be true or false`);
}

export function validateEnv(config: EnvConfig) {
  const validatedConfig = { ...config };

  for (const key of requiredStringKeys) {
    validatedConfig[key] = requireString(config, key);
  }

  for (const key of requiredNumberKeys) {
    validatedConfig[key] = requireNumber(config, key);
  }

  for (const key of requiredBooleanKeys) {
    validatedConfig[key] = requireBoolean(config, key);
  }

  const origins = String(validatedConfig.ORIGINS)
    .split(';')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('Environment variable ORIGINS must contain at least one origin');
  }

  const sameSite = String(validatedConfig.AUTH_COOKIE_SAME_SITE).toLowerCase();

  if (!['strict', 'lax', 'none'].includes(sameSite)) {
    throw new Error('Environment variable AUTH_COOKIE_SAME_SITE must be strict, lax or none');
  }

  validatedConfig.AUTH_COOKIE_SAME_SITE = sameSite;

  return validatedConfig;
}
