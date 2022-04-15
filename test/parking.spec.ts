import Car from 'App/Models/Car'
import test from 'japa'



const BASE_URL = `http://127.0.0.1:3333`
const testid = 1
const testname = 'testname'
test.group('http request', () => {

  test('base URL',(assert)=>{
    assert.equal('http://127.0.0.1:3333',BASE_URL)
  })


  test('GET INDEX /parking', async (assert) => {
    const crud = await Car.all()
    const data = {data:crud}
    assert.equal(crud, data.data)
  })

  test(`GET SHOW /parking/${testid}`, async (assert) => {
    const crud = await Car.find(testid)
    const data = {data:crud}
    assert.equal(crud, data.data)
  })

  test(`POST CREATE /parking`, async (assert) => {
    const crud =  await Car.create({
      entrance:'X',
      slot_type: "SP",
      vehicle_type:"SMALL",
      duration: 4
    })
    assert.equal(crud.entrance, 'X')
    assert.equal(crud.slot_type, 'SP')
    assert.equal(crud.vehicle_type, 'SMALL')
    assert.equal(crud.duration, 4)
  })

  test(`PUT UPDATE /parking/${testid}`, async (assert) => {
    const cars = await Car.find(testid)
    cars.status = "UN-PARKED"
    cars.save()
    assert.equal(cars.status ,"UN-PARKED")   
  })

  test(`DELETE DESTROY /parking/${testid}`, async (assert) => {
    const cars = await Car.find(testid)
    cars.delete() 
    assert.equal(cars.id ,testid)
  })


})