import { loadHeartbeats, saveHeartbeat, Heartbeat } from '../../heartbeat'

export const emptyFile = async () => {
    let heartbeats: Heartbeat[] = await loadHeartbeats() 

    heartbeats = heartbeats.filter(() => false)
    
    saveHeartbeat(heartbeats)
   
}

export const setup = async () => {
    await emptyFile()
    let heartbeats: Heartbeat[] = await loadHeartbeats()
    heartbeats = [{group: 'testOne', 
        id: 'test1234', 
        createdAt: Date.now(), 
        updatedAt: Date.now(), 
        meta: {}}, 
    {group: 'testOne', 
        id: 'test123', 
        createdAt: Date.now(), 
        updatedAt: Date.now(), 
        meta: {foo: 'meta test'}}]
    saveHeartbeat(heartbeats)
}

setup()
