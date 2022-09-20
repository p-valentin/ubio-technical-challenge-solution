import { addHeartbeat, getHeartbeats, getGroup, deleteHeartbeat, loadHeartbeats, saveHeartbeat, Heartbeat } from '../../heartbeat'

export const emptyFile = async () => {
    let heartbeats: Heartbeat[] = await loadHeartbeats() 

    heartbeats = heartbeats.filter(heartbeat => false)
    
    saveHeartbeat(heartbeats)
   
}

export const heartbeatOne = {
    id: "test123",
    group: "testOne",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    meta: {}
}

export const heartbeatTwo = {
    id: "test1234",
    group: "testOne",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    meta: {
        foo: "meta test"
    }
}

export const heartbeatThree = {
    id: "test12346",
    group: "testOne",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    meta: {
        foo: "meta test two"
    }
}

export const heartbeatFour = {
    id: "test",
    group: "testTwo",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    meta: {
        foo: ""
    }
}

export const heartbeatFive = {
    id: "test123",
    group: "testTwo",
    createdAt: Date.now(),
    updatedAt: Date.now(),
}

export const heartbeatSix = {
    id: "test123",
    group: "testThree",
    createdAt: Date.now(),
    updatedAt: Date.now(),
}

export const setup = async () => {
    await emptyFile()

    await addHeartbeat('testOne', 'test123', {})
   
    await addHeartbeat('testOne', 'test1234', {foo: 'meta test'})
}

setup()
