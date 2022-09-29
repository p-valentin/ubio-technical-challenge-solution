import express from 'express'
import bodyParser from 'body-parser'
import { addHeartbeat, getHeartbeats, getGroup, deleteHeartbeat, Heartbeat } from './heartbeat'
import { isEmpty } from './utils/utils'

export const app = express()


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

export interface Info {
    info: string
}

app.post('/:group/:id', async (req, res, next) => {
    try {
        const group = req.params.group
        const id = req.params.id
        const meta = req.body
        res.status(201).send(await addHeartbeat(group, id, meta))
    } catch(e) {
        next(e)
    }
})

app.get('', async (req, res, next) => {
    try {
        const heartbeats = await getHeartbeats()
        if(heartbeats.length === 0) {
            const info: Info = {info: 'No groups found'}
            return res.status(404).send(info)
        }
        res.status(200).send(heartbeats)
    } catch (e) {
        next(e)
    }
})

app.get('/:group', async (req, res, next) => {
    try {
        const group = await getGroup(req.params.group)
        if(group.length === 0) {
            const info: Info = {info: 'Group not found'}
            return res.status(404).send(info)
        }
        return res.status(200).send(group)
    } catch (e) {
        next(e)
    }
})

app.delete ('/:group/:id', async (req, res, next) => {
    try {
        const heartbeat = await deleteHeartbeat(req.params.group, req.params.id)
        if(isEmpty(heartbeat as Heartbeat)) {
            const info: Info = {info: 'Registration not found'}
            return res.status(404).send(info)
        }
        return res.status(200).send(heartbeat)
    } catch (e) {
        next(e)
    }
})

export default app
