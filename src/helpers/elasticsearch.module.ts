import { Client, ClientOptions } from '@elastic/elasticsearch';
import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class ElasticSearchModule {
  static register(options: ClientOptions): DynamicModule {
    const elasticSearchProvider = {
      provide: 'ELASTIC_SEARCH',
      useFactory: () => {
        return new Client(options);
      },
    };

    return {
      global: true,
      module: ElasticSearchModule,
      providers: [elasticSearchProvider],
      exports: [elasticSearchProvider],
    };
  }
}
