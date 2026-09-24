import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { ProgressModule } from './progress/progress.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env.local', 'apps/api/.env', '.env.local', '.env'],
    }),
    AuthModule,
    SupabaseModule,
    CurriculumModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
