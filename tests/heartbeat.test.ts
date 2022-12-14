import request from 'supertest'
import { app } from '../app'
import { loadHeartbeats, Heartbeat } from '../heartbeat'
import { setup } from './fixtures/setup'
import { myInterval } from '../heartbeat'

beforeEach(setup)
afterEach(() => {
    myInterval(false)
})

describe('test POST endpoint', () => {
    test('Should add a new heartbeat registration', async () => {
        jest.useFakeTimers()
        const response = await request(app)
            .post('/newHeartbeat/newId')
            .send({'testKey': 'testValue'})
            .expect(201)
    
        const heartbeats = await loadHeartbeats()
        
        const selectedHeartbeat: Heartbeat = heartbeats.filter((hearbeat: Heartbeat) => hearbeat.group === 'newHeartbeat')
            .find((heartbeat: Heartbeat) => heartbeat.id === 'newId')
    
        expect(selectedHeartbeat).not.toBeNull()
    
        expect(response.body).toMatchObject({
            id: 'newId',
            group: 'newHeartbeat',
            meta: {testKey: 'testValue'}
        })
    
        expect(heartbeats.length).toEqual(3)
    })

    test('updatedAt should change', async () => {
        jest.useFakeTimers()
        const initialList = await loadHeartbeats()
        
        const initialSelected: Heartbeat = initialList.filter((hearbeat: Heartbeat) => hearbeat.group === 'testOne')
            .find((heartbeat: Heartbeat) => heartbeat.id === 'test1234')
    
        const initialCreated = initialSelected.createdAt
        expect(initialCreated).not.toBeNull()
    
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
})

describe('test GET endpoint', () => {
    test('Should return all groups and instances', async () =>  {
        await request(app)
            .post('/newHeartbeat/newId')
            .send({'testKey': 'testValue'})
            .expect(201)
    
        const response = await request(app)
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

    test('Array if group not found', async () => {
        const response = await request(app)
            .get('/notFound')
            .send()
            .expect(404)
    
        expect(response.body).toMatchObject({info: 'Group not found'})
    })
})

describe('test DELETE endpoint', () => {
    test('Should delete one instance of heartbeat', async () => {
        const heartbeats = await loadHeartbeats()
        const initialLength = heartbeats.length
        const response = await request(app)
            .delete('/testOne/test1234')
            .send()
            .expect(200)
        
        expect(response.body.length).not.toEqual(initialLength)
    })

    test('200 and info if instance not found', async () => {
        const response = await request(app)
            .delete('/abc/notFound')
            .send()
            .expect(404)
    
        expect(response.body).toMatchObject({info: 'Registration not found'})
    })
})
