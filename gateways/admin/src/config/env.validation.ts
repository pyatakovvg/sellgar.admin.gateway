type EnvConfig = Record<string, unknown>;

const requiredStringKeys = [
  'ORIGINS',
  'AUTH_COOKIE',
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

export function validateEnv(config: EnvConfig) {
  const validatedConfig = { ...config };

  for (const key of requiredStringKeys) {
    validatedConfig[key] = requireString(config, key);
  }

  for (const key of requiredNumberKeys) {
    validatedConfig[key] = requireNumber(config, key);
  }

  const origins = String(validatedConfig.ORIGINS)
    .split(';')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('Environment variable ORIGINS must contain at least one origin');
  }

  return validatedConfig;
}
