import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChannelModule } from './channel/channel.module';
import { typeOrmConfig } from './config/typeorm.config';
import { SeederModule } from './database/seeders/seeder.module';
import { ResponseMiddleware } from './middleware/response.middleware';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    VideoModule,
    ChannelModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseMiddleware).forRoutes('*');
  }
}
