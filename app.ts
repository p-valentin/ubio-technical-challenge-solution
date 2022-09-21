import express from 'express'
import bodyParser from 'body-parser'
import { addHeartbeat, getHeartbeats, getGroup, deleteHeartbeat } from './heartbeat'

export const app = express()


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


app.post('/:group/:id', async (req, res) => {
    try {
        const group = req.params.group
        const id = req.params.id
        const meta = req.body
        
        res.status(201).send(await addHeartbeat(group, id, meta))
    } catch(e) {
        return res.status(500).send(e)
    }
})

app.get('', async (req, res) => {
    try {
        const heartbeats = await getHeartbeats()
        if(heartbeats.length === 0) {
            return res.status(200).send({info: 'No groups found'})
        }

        res.status(200).send(heartbeats)
    } catch (e) {
        return res.status(500).send(e)
    }
})

app.get('/:group', async (req, res) => {
    try {
        const group = await getGroup(req.params.group)
        if(group.length === 0) {
            return res.status(200).send({info: 'Group not found'})
        }
        return res.status(200).send(group)
    } catch (e) {
        return res.status(500).send(e)
    }
})

app.delete ('/:group/:id', async (req, res) => {
    try {
        const heartbeat = await deleteHeartbeat(req.params.group, req.params.id)
        if(heartbeat === '') {
            return res.status(200).send({info: 'Registration not found'})
        }
        return res.status(200).send(heartbeat)
    } catch (e) {
        return res.status(500).send(e)
    }
})

export default app