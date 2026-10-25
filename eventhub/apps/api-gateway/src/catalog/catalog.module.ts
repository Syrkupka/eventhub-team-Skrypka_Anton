import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { EventRepository } from "./event.repository";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, EventRepository],
  // EventRepository навмисно не експортується:
  // інші модулі ходять у каталог лише через CatalogService
  exports: [CatalogService],
})
export class CatalogModule {}
