import { Module } from "@nestjs/common";
import { CatalogModule } from "./catalog/catalog.module";
import { HealthModule } from "./health/health.module";

/**
 * Кореневий модуль застосунку.
 *
 * У тижні 2 сюди додадуться CatalogModule і спільні провайдери
 * (валідація конфігурації, логер, фільтр помилок).
 */
@Module({
  imports: [HealthModule, CatalogModule],
})
export class AppModule {}
