import groupBy from 'lodash.groupby'
import { Heartbeat } from '../heartbeat'

interface AllHeartbeats {
    group: string,
    instances: number,
    createdAt: number,
    lastUpdatedAt: number
}

interface Groups {
    [group: string]: Heartbeat[]
}

export const group = (data: Heartbeat[]) => groupBy(data, 'group')

export const groups =  (groups: Groups) => {
    const allGroups: AllHeartbeats[] = []
    
    Object.entries(groups).forEach((el: [string, Heartbeat[]]) => {
        const group: AllHeartbeats = {
            group: el[0],
            instances: el[1].length,
            createdAt: el[1].sort((a: Heartbeat, b: Heartbeat) => a.createdAt - b.createdAt)[0].createdAt,
            lastUpdatedAt: el[1].sort((a: Heartbeat, b: Heartbeat) => a.updatedAt + b.updatedAt)[0].updatedAt
        }
        allGroups.push(group)
    })

    if(allGroups.length === 0) {
        return []
    }

    return allGroups
}

export const isEmpty = (object: Heartbeat) => {
    for (const _property in object) {
        return false
    }
    return true
}
