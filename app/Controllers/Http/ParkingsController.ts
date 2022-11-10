import type { HttpContextContract, } from '@ioc:Adonis/Core/HttpContext'
import Car from 'App/Models/Car';
import CarValidator from 'App/Validators/CarValidator';
import NumberValidator from 'App/Validators/NumberValidator';
import { DateTime } from 'luxon';


export default class ParkingsController {


  public async index({response,request}:HttpContextContract){
    const filters = request.only(["entrance", "slot_type", "vehicle_type",'keyword', 'status']);
    const meta = request.only(["page", "per_page"]);

    try {

      
    const querys = Car.query()
    if (filters.entrance) {
      querys.where('entrance', filters.entrance)
    }
    if (filters.slot_type) {
      querys.where('slot_type', filters.slot_type)
    }
    if (filters.vehicle_type) {
      querys.where('vehicle_type', filters.vehicle_type)
    }
    if (filters.status) {
      querys.where('status', filters.status)
    }
    if (filters.keyword) {
      querys.where('entrance', 'like', `%${filters.keyword}%`)
    }
    const data = await querys.orderBy('id','desc')  
    .paginate(meta.page, meta.per_page)
    return response.ok({
      message:"ok",
      parked_cars:data
    })
      
    } catch (error) {
      
      return response.notFound({
        "message":"Request Not found"
      })
    }
  }

  public async show({params, response}:HttpContextContract){
    const parkedCar = await Car.findOrFail(params.id)
    return response.ok({
      message:'ok',
      car_data:{
        data: {
          id:parkedCar.id,
          parking_location:parkedCar.entrance,
          parking_type: parkedCar.slot_type,
          vehicle_type:parkedCar.vehicle_type,
          park_duration:`${parkedCar.duration} hrs`,
          status:parkedCar.status,
          balance: `${parkedCar.amount}.00 PHP`,
          created: parkedCar.createdAt
        }
    
      },
    })
  }

  public async store({request,response}:HttpContextContract){
    //validation
    const validCar = await request.validate(CarValidator)
      if(validCar.duration_estimate > 48 || validCar.duration_estimate < 1 ){
        return response.badRequest({message:'duration is not valid!'})
      }
    //check if it is inside the correct parking lot
    if(validCar.vehicle_type === "LARGE"){
      switch (validCar.slot_type) {
        case "SP":
          return response.badRequest({message:'LARGE vehicle are not allowed on SP!'})
        case "MP":
          return response.badRequest({message:'LARGE vehicle are not allowed on MP!'})  
        default:
      }     
    }
    if(validCar.vehicle_type === "MEDIUM"){
      switch (validCar.slot_type) {
        case "SP":
          return response.badRequest({message:'MEDIUM vehicle are not allowed on SP!'})
        default:
      }     
    }
        //computation 
        let roundOff = Math.round(validCar.duration_estimate)
        let initialAmount = 40
        let additionalAmount = 0
        let extendedDuration =  roundOff - 3

        if (validCar.slot_type ==="SP"){
          additionalAmount = extendedDuration * 20
        }
        if (validCar.slot_type ==="MP"){
          additionalAmount = extendedDuration * 60
        }
        if (validCar.slot_type ==="LP"){
          additionalAmount = extendedDuration * 100
        }
        //if exceed 24hrs
        if(validCar.duration_estimate > 24){
          switch (validCar.slot_type) {
            case "SP":
              additionalAmount = (5000 - 40) + (roundOff-24) * 20
              break;
            case "MP":
              additionalAmount = (5000 - 40) + (roundOff-24) * 60
              break;
            case "LP":
              additionalAmount = (5000 - 40) + (roundOff-24) * 100
              break;  
            default:
              break;
          }
          
        }
        if(validCar.duration_estimate == 48){
          switch (validCar.slot_type) {
            case "SP":
              additionalAmount = (10000 - 40) + (roundOff-48) * 20
              break;
            case "MP":
              additionalAmount = (10000 - 40) + (roundOff-48) * 60
              break;
            case "LP":
              additionalAmount = (10000 - 40) + (roundOff-48) * 100
              break;  
            default:
              break;
          }
         
        }
        const final_amount = initialAmount + additionalAmount

        //insert to database
        const created = await Car.create({
            entrance: validCar.entrance,
            slot_type: validCar.slot_type,
            vehicle_type: validCar.vehicle_type,
            duration:roundOff,
            amount: final_amount.toString()
          })
          //response
    return response.created({
      message: 'Car  Accepted',
        data: {
          id:created.id,
          parking_location:created.entrance,
          parking_type: created.slot_type,
          vehicle_type:created.vehicle_type,
          park_duration:`${created.duration} hrs`,
          status:created.status,
          balance: `${final_amount}.00 PHP`,
          created: created.createdAt}
        })
  }

  public async update({params,request, response}:HttpContextContract){

    const extended_hours = await request.validate(NumberValidator)
    const roundOff = Math.round(extended_hours.extended_hours)
    const status = request.input('status')
    if(!extended_hours){
      return response.badRequest({message:'duration is not valid!'})
    }
    if(extended_hours.extended_hours > 48 || extended_hours.extended_hours < 1){
      return response.badRequest({message:'duration is not valid!'})
    }
    if(status != 'PARKED' && status != 'UN-PARKED'){
      return response.badRequest({message:'status is not valid! Choose (PARKED, UN-PARKED)'})
    }
    const parkedCar = await Car.findOrFail(params.id)
    
    //check the current parking for additional computation
    let additionalAmount = 0
      switch (parkedCar.slot_type) {
        case 'SP':
          additionalAmount = roundOff * 20
          break;
        case 'MP':
          additionalAmount = roundOff * 60
          break;
        case 'LP':
          additionalAmount = roundOff * 100
          break;  
        default:
          break;
    }
    const currentAmount = parseInt(parkedCar.amount)
    const totalAmount = currentAmount + additionalAmount
    parkedCar.duration = parkedCar.duration + roundOff
    parkedCar.amount  =  totalAmount.toString()
    parkedCar.status = status
    parkedCar.save()

    return response.ok({
      message:'Parking Updated',
      data:{
        id:parkedCar.id,
        parking_location:parkedCar.entrance,
        parking_type: parkedCar.slot_type,
        vehicle_type:parkedCar.vehicle_type,
        modified_duration:`+${roundOff}hrs`,
        modified_status:parkedCar.status,
        balance: `${totalAmount}.00 PHP`,
        updated_at: parkedCar.updatedAt,
      }

    })
   
  }

  public async destroy({params,response}:HttpContextContract){
    const parkedCar = await Car.findOrFail(params.id)
    parkedCar.delete()
    return response.accepted({
      message:'THANK YOU FOR USING XYZ PARKING LOT',
      data:{
        parked_time: `${parkedCar.duration} hrs`,
        paid:`${parkedCar.amount}.00 PHP`,
        status:'UN-PARKED',
        data: DateTime.now().setZone('Asia/Manila')}
      })
  
  }

}
