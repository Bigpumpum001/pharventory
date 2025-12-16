export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export default () => ({
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mydb',
    synchronize: process.env.DB_SYNC === 'true' ? true : false, // สำหรับ dev เท่านั้น
    logging: process.env.DB_LOGGING === 'true' ? true : false,
  },
});
