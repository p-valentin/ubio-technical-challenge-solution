import fs from 'fs/promises'
import * as dotenv from 'dotenv'
import { group, groups, isEmpty } from './utils/utils'

dotenv.config({ path: __dirname + '/.env' })
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: __dirname+'../../.env' })

export interface Heartbeat {
    id: string,
    group: string,
    createdAt: number,
    updatedAt: number,
    meta: object | null
}

export const addHeartbeat = async (group: string, id: string, meta: object) => {
    const heartbeats: Heartbeat[] = await loadHeartbeats()
    const duplicateHeartbeat: Heartbeat =  heartbeats.filter((heartbeat: Heartbeat) => heartbeat.group === group)
        .find((heartbeat: Heartbeat) => heartbeat.id === id) as Heartbeat

    if(!duplicateHeartbeat) {
        const heartbeat: Heartbeat = {
            id,
            group,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            meta
        }
        heartbeats.push(heartbeat)
        await saveHeartbeats(heartbeats)
        return heartbeat
    } else {
        
        if(isEmpty(duplicateHeartbeat.meta as Heartbeat)) {
            duplicateHeartbeat.meta = meta
        }

        duplicateHeartbeat.updatedAt = Date.now()
        await saveHeartbeats(heartbeats)      
        return duplicateHeartbeat
    }
}

export const getHeartbeats = async () => { 
    const heartbeats: Heartbeat[] = await loadHeartbeats()
    const grouped = group(heartbeats)
    return groups(grouped)
}

export const getGroup = async (group: string) => {
    const heartbeats: Heartbeat[] = await loadHeartbeats()
    const selectedGroup: Heartbeat[] = heartbeats.filter((hearbeat: Heartbeat) => hearbeat.group === group)
    if(selectedGroup.length === 0) {
        return []
    }
    return selectedGroup
}

export const deleteHeartbeat = async (group: string, id: string) => {
    let heartbeats: Heartbeat[] = await loadHeartbeats() 
    const selectedHeartbeat: Heartbeat = heartbeats.filter((hearbeat: Heartbeat) => hearbeat.group === group)
        .find((heartbeat: Heartbeat) => heartbeat.id === id) as Heartbeat
    
    if(isEmpty(selectedHeartbeat)) {
        return {}
    }

    heartbeats = heartbeats.filter(heartbeat => heartbeat !== selectedHeartbeat)
    
    await saveHeartbeats(heartbeats)

    return heartbeats
}

export const saveHeartbeats = async (heartbeats: Heartbeat[]) => {
    const dataJson = JSON.stringify(heartbeats)    
    try {
        await fs.writeFile('heartbeats.json', dataJson)
    } catch (e) {
        return e
    }
    
}

export const loadHeartbeats = async () => {
    try {
        const data = await fs.readFile('heartbeats.json')
        return JSON.parse(data.toString())
    } catch(e) {
        return []
    } 
}

export const myInterval = async (run: boolean) => {
    if(run === false) {
        return
    }

    let heartbeats: Heartbeat[] = await loadHeartbeats()

    const time = Date.now()
    heartbeats = heartbeats.filter((item) =>  time < item.updatedAt + Number(process.env.EXPIRATION))

    await saveHeartbeats(heartbeats)
    
    setTimeout(async () => {
        await myInterval(true)
    }, 2000).unref()

    
    
}

myInterval(true)
