import { schema } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CarValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    
    entrance: schema.enum([
      'X',
      'Y',
      'Z',
      
    ]),

    vehicle_type: schema.enum([
      'SMALL',
      'MEDIUM',
      'LARGE',
      
    ]),

    slot_type: schema.enum([
      'SP',
      'MP',
      'LP',
      
    ]),

    duration_estimate: schema.number()
  
   
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {
    'vehicle_type.required': 'Please provide your Vehicle type (SMALL, MEDIUM, LARGE).',
    'entrance.required': 'Please Select your Entrance (X,Y,Z)',
    'duration_estimate.required': 'Please provide your Estimated duration time of parking in: (HOURS)',
    'slot_type.required': 'Please provide your Parking slot-type (SP, MP, LP)',
  }
}
