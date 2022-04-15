import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Cars extends BaseSchema {
  protected tableName = 'cars'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('entrance', ['X', 'Y', 'Z']).defaultTo('X')
      table.enum('slot_type', ['SP', 'MP', 'LP']).defaultTo('SP')
      table.enum('vehicle_type', ['SMALL', 'MEDIUM', 'LARGE']).defaultTo('SMALL')
      table.integer('duration').notNullable()
      table.string('amount').nullable()
      table.enum('status',['PARKED','UN-PARKED']).defaultTo('PARKED')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
