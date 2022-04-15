import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Car extends BaseModel {
  @column({ isPrimary: true })
  public id: number


  @column()
  public entrance:string

  @column()
  public slot_type:string

  @column()
  public vehicle_type:string

  @column()
  public duration:number

  @column()
  public amount:string

  @column()
  public status:string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
