import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { StockLogsModule } from './modules/stock-logs/stock-logs.module';
// import { RedisModule } from './modules/redis/redis.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { RolesModule } from './modules/roles/roles.module';
import { MedicineBatchesModule } from './modules/medicine-batches/medicine-batches.module';
import databaseConfig, { DatabaseConfig } from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispenseModule } from './modules/dispense/dispense.module';
import { CategoryModule } from './modules/category/category.module';
import { UnitsModule } from './modules/units/units.module';
import { UploadModule } from './modules/upload/upload.module';
@Module({
  imports: [
    UsersModule,
    AuthModule,
    MedicinesModule,
    // RedisModule,
    StockLogsModule,
    ReceiptsModule,
    RolesModule,
    DispenseModule,
    MedicineBatchesModule,
    CategoryModule,
    UnitsModule,
    UploadModule,

    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: db.synchronize,
          logging: db.logging,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
