import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Car from 'App/Models/Car';
import { DateTime } from 'luxon'
export default class Parking2sController {


  public async store({response}:HttpContextContract){

    //Auto generate INPUTS
    const entranceOption = ["X", "Y", "Z"];
    const findEntrance = Math.floor(Math.random() * entranceOption.length)
    const autoEntrance = entranceOption[findEntrance]

    const typeOption = ['SMALL','MEDIUM','LARGE']
    const findOption = Math.floor(Math.random() * typeOption.length)
    const autoType = typeOption[findOption]

    const slotOption = ['SP','MP','LP',]
    const findSlot = Math.floor(Math.random() * slotOption.length)
    const autoSlot = slotOption[findSlot]

    const autoDuration = Math.floor(Math.random() * 49);

    //validation
      if(autoDuration > 48 || autoDuration < 1 ){
        return response.badRequest({message:'duration is not valid!'})
      }

    //check if it is inside the correct parking lot
    if(autoType === "LARGE"){
      switch (autoSlot) {
        case "SP":
          return response.badRequest({
            message:'LARGE vehicle are not allowed on SP!',
              data: {
                parking_location:autoEntrance,
                parking_type: autoSlot,
                vehicle_type:autoType,
                status:"PARK NOT ALLOWED",
                date: DateTime.now().setZone('Asia/Manila')
                }
            })
        case "MP":
          return response.badRequest({
            message:'LARGE vehicle are not allowed on MP!',
              data: {
                parking_location:autoEntrance,
                parking_type: autoSlot,
                vehicle_type:autoType,
                status:"PARK NOT ALLOWED",
                date: DateTime.now().setZone('Asia/Manila')
                }
          })  
        default:
      }     
    }
    if(autoType === "MEDIUM"){
      switch (autoSlot) {
        case "SP":
          return response.badRequest({
            message:'MEDIUM vehicle are not allowed on SP!',
            data: {
              parking_location:autoEntrance,
              parking_type: autoSlot,
              vehicle_type:autoType,
              status:"PARK NOT ALLOWED",
              date: DateTime.now().setZone('Asia/Manila')
              }
          })
        default:
      }     
    }
        //computation 
        let roundOff = Math.round(autoDuration)
        let initialAmount = 40
        let additionalAmount = 0
        let extendedDuration =  roundOff - 3

        if (autoSlot ==="SP"){
          additionalAmount = extendedDuration * 20
        }
        if (autoSlot ==="MP"){
          additionalAmount = extendedDuration * 60
        }
        if (autoSlot ==="LP"){
          additionalAmount = extendedDuration * 100
        }

        //exceeds 24hrs parking
        // if(autoDuration > 24){
        //   additionalAmount = 5000 - 40
        // }
        // if(autoDuration == 48){
        //   additionalAmount = 10000 - 40
        // }

        if(autoDuration > 24){
          switch (autoSlot) {
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
        if(autoDuration == 48){
          switch (autoSlot) {
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
            entrance: autoEntrance,
            slot_type: autoSlot,
            vehicle_type: autoType,
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
}
