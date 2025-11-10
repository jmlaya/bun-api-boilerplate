export const config = {
  /*
  |--------------------------------------------------------------------------
  | General
  |--------------------------------------------------------------------------
  |
  | General application configuration such as URLs, debug flags, CORS origins, 
  | and system stage.
  | 
  | Port 3001 by default
  | Host localhost by default
  | CORS allow all origins by default
  |
  */
  general: {
    port: parseInt(process.env.PORT || '3001', 10),
    webAppUrl: process.env.WEBAPP_URL || 'http://localhost:3000',
    debug: process.env.DEBUG === 'true',
    isProduction: process.env.NODE_ENV === 'production',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) : '*',
  },

  /*
  |--------------------------------------------------------------------------
  | Database Connection
  |--------------------------------------------------------------------------
  |
  | Below is all of the database connection defined for your application.
  | Currently just PostgreSQL is supported.
  | An example configuration is provided. You're free to change the values.
  |
  | Maximum 20 concurrent connections by default
  | Maximum connection 1 hour lifetime by default
  | Close idle connections after 30s by default
  | Connection timeout in 10s by default
  |
  */
  database: {
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'postgres',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    schema: process.env.DATABASE_SCHEMA || 'public',
    max: process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE, 10) : 20,
    maxLifetime: process.env.DATABASE_MAX_LIFETIME ? parseInt(process.env.DATABASE_MAX_LIFETIME, 10) : 3600,
    idleTimeout: process.env.DATABASE_IDLE_TIMEOUT ? parseInt(process.env.DATABASE_IDLE_TIMEOUT, 10) * 1000 : 30,
    connectionTimeout: process.env.DATABASE_CONNECTION_TIMEOUT
      ? parseInt(process.env.DATABASE_CONNECTION_TIMEOUT, 10) * 1000
      : 10,
  },

  /*
  |--------------------------------------------------------------------------
  | Authentication Defaults
  |--------------------------------------------------------------------------
  |
  | This option defines the default authentication "secrets" and token 
  | expiration settings for your application. You may change these values
  | as required, but they're a perfect start for most applications.
  |
  */
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'supersecret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecret',
    accessTokenExpires: process.env.JWT_ACCESS_TOKEN_EXPIRES || '15m',
    refreshTokenExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES || '7d',
  },

  /*
  |--------------------------------------------------------------------------
  | Mail Configurations
  |--------------------------------------------------------------------------
  |
  | Here you may configure all of the mailers used by your application plus
  | their respective settings. Several examples have been configured for
  | you and you are free to add your own as your application requires.
  |
  | Currently is supported a variety of mail "transport" drivers that can be used
  | when delivering an email. You may specify which one you're using for
  | your mailers below. You may also add additional mailers if needed.
  |
  | Supported: "smtp", "sendmail", "mailgun", "ses", "ses-v2",
  |            "postmark", "resend", "log", "array",
  |            "failover", "roundrobin"
  |
  */
  email: {
    driver: process.env.MAIL_DRIVER || 'smtp',
    config: {
      host: process.env.MAIL_HOST || 'localhost',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      user: process.env.MAIL_USER || 'user',
      password: process.env.MAIL_PASSWORD || 'password',
      secure: process.env.MAIL_SECURE === 'true',
      from: process.env.MAIL_FROM || 'noreply@example.com',
    },
    tamplateVariables: {
      supportEmail: process.env.MAIL_VARIABLE_SUPPORT_EMAIL || 'suppport@stg.freewill.vision',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Filesystem Disks
  |--------------------------------------------------------------------------
  |
  | Below you may configure as many filesystem disks as necessary, and you
  | may even configure multiple disks for the same driver. Examples for
  | most supported storage drivers are configured here for reference.
  |
  | Supported drivers: "local", "ftp", "sftp", "s3"
  |
  | Example configuration for s3 driver
  | {
  |    driver: 's3',
  |    config: {
  |      key: process.env.S3_ACCESS_KEY_ID,
  |      secret: process.env.S3_SECRET_ACCESS_KEY,
  |      region: process.env.S3_DEFAULT_REGION,
  |      bucket: process.env.S3_BUCKET,
  |      url: process.env.S3_FILE_URL,
  |      prefix: process.env.S3_PREFIX || '',
  |      endpoint: process.env.S3_ENDPOINT,
  |      use_path_style_endpoint: process.env.S3_USE_PATH_STYLE_ENDPOINT || false,
  |      throw: false,
  |      report: false,
  |    }
  | }
  |
  */
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    config: {
      root: process.env.STORAGE_PATH || 'app/private',
      serve: true,
      throw: false,
      report: false,
    },
  },
};
