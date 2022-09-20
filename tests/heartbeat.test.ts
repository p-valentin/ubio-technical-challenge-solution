import request from 'supertest'
import { app } from "../app"
import { loadHeartbeats, Heartbeat } from '../heartbeat'
import { setup } from "./fixtures/setup"

beforeEach(setup)

test('Should add a new heartbeat registration', async () => {
    const response = await request(app)
        .post('/newHeartbeat/newId')
        .send({'testKey': 'testValue'})
        .expect(201)

    const heartbeats = await loadHeartbeats()
    
    const selectedHeartbeat: any = heartbeats.filter((hearbeat: Heartbeat) => hearbeat.group === 'newHeartbeat')
        .find((heartbeat: Heartbeat) => heartbeat.id === 'newId')

    expect(selectedHeartbeat).not.toBeNull()

    expect(response.body).toMatchObject({
        id: 'newId',
        group: 'newHeartbeat',
        meta: {testKey: 'testValue'}
    })

    expect(heartbeats.length).toEqual(3)
})

test('Should return all groups and instances', async () =>  {
    let response = await request(app)
        .post('/newHeartbeat/newId')
        .send({'testKey': 'testValue'})
        .expect(201)

    response = await request(app)
        .get('')
        .send()
        .expect(200)

    expect (response.body.length).toEqual(2)
})

test('Should return all instances from one group', async () => {
    const response = await request(app)
        .get('/testOne')
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)

})

test('Should delete one instance of heartbeat', async () => {
    const heartbeats = await loadHeartbeats()
    const initialLength = heartbeats.length
    const response = await request(app)
        .delete('/testOne/test1234')
        .send()
        .expect(200)
    
    expect(response.body.length).not.toEqual(initialLength)
})

test('updatedAt should change', async () => {
    let initialList = await loadHeartbeats()
    
    let initialSelected: any = initialList.filter((hearbeat: Heartbeat) => hearbeat.group === 'testOne')
        .find((heartbeat: Heartbeat) => heartbeat.id === 'test1234')
    
    const initialCreated = initialSelected.createdAt

    const response = await request(app)
        .post('/testOne/test1234')
        .send({testKey: 'testValue'})
        .expect(201)

    
    const heartbeats = await loadHeartbeats()
    
    const selectedHeartbeat = heartbeats.filter((hearbeat: Heartbeat) => hearbeat.group === 'testOne')
            .find((heartbeat: Heartbeat) => heartbeat.id === 'test1234')
          
    expect(selectedHeartbeat).not.toBeNull()

    expect(response.body).toMatchObject({
        id: 'test1234',
        group: 'testOne',
        meta: {testKey: 'testValue'}
    })
    
    expect(selectedHeartbeat.updatedAt).not.toEqual(initialCreated)

    expect(heartbeats.length).toEqual(2)
})

test('404 if no Id or Group', async () => {
    await request(app)
        .post('/testTwo')
        .send()
        .expect(404)
    
    await request(app)
        .post('')
        .send()
        expect(404)
})

test('200 and info if instance not found', async () => {
    const response = await request(app)
        .delete('/abc/notFound')
        .send()
        .expect(200)

    expect(response.body).toMatchObject({info: "Registration not found"})
})

test('Array if group not found', async () => {
    const response = await request(app)
        .get('/notFound')
        .send()
        .expect(200)

    expect(response.body).toMatchObject({info: "Group not found"})
})