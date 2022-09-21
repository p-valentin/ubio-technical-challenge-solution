import fs from 'fs/promises'
import * as dotenv from 'dotenv'

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
    const duplicateHeartbeat: any =  heartbeats.filter((heartbeat: Heartbeat) => heartbeat.group === group)
        .find((heartbeat: Heartbeat) => heartbeat.id === id)

    if(!duplicateHeartbeat) {
        const heartbeat: Heartbeat = {
            id,
            group,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            meta
        }
        heartbeats.push(heartbeat)
        saveHeartbeat(heartbeats)
        return heartbeat
    } else {
        if(duplicateHeartbeat.meta !== '') {
            duplicateHeartbeat.meta = meta
        }
        duplicateHeartbeat.updatedAt = Date.now()
        saveHeartbeat(heartbeats)      
        return duplicateHeartbeat
    }
}

export const getHeartbeats = async () => {
    interface allHeartbeats {
        group: string,
        instances: number,
        createdAt: number,
        lastUpdatedAt: number
    }

    const heartbeats: Heartbeat = await loadHeartbeats()
    const allGroups: allHeartbeats[] = []
    
    const groupBy = (data: any, key: any) => {
        return data.reduce(function(curr: any, prev: any) {
            (curr[prev[key]] = curr[prev[key]] || []).push(prev)
            return curr
        }, {})
    }

    
    const groups = groupBy(heartbeats, 'group')


    Object.entries(groups).forEach((el: any) => {
        const group: allHeartbeats = {
            group: el[0],
            instances: el[1].length,
            createdAt: el[1].sort((a: any, b: any) => a.createdAt - b.createdAt)[0].createdAt,
            lastUpdatedAt: el[1].sort((a: any, b: any) => a.updatedAt + b.updatedAt)[0].updatedAt
        }
        allGroups.push(group)
    })

    if(allGroups.length === 0) {
        return []
    }


    return allGroups
    
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
    const selectedHeartbeat: any = heartbeats.filter((hearbeat: Heartbeat) => hearbeat.group === group)
        .find((heartbeat: Heartbeat) => heartbeat.id === id)
    
    if(!selectedHeartbeat) {
        return ''
    }

    heartbeats = heartbeats.filter(heartbeat => heartbeat !== selectedHeartbeat)
    
    saveHeartbeat(heartbeats)

    return heartbeats
}

export const saveHeartbeat = async (heartbeats: Heartbeat[]) => {
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


        
export const myInterval = setInterval(async () => {
    let heartbeats: Heartbeat[] = await loadHeartbeats()
    
    const time = Date.now()
    heartbeats = heartbeats.filter(function(item) {
        return time < item.updatedAt + Number(process.env.EXPIRATION)
    })
    saveHeartbeat(heartbeats)
}, 5000)


