import { Migration } from '@mikro-orm/migrations';

export class Migration20200921090530 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "text" text not null);');
  }

}
