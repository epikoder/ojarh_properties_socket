import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import dotenv from 'dotenv'
import { allowedOrigin } from './utils/cors';
import { authenticateUser } from './utils/auth';
import { query } from './utils/db';
dotenv.config()

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		credentials: true,
		origin(requestOrigin, callback) {
			callback(null, allowedOrigin(requestOrigin!))
		},
	}
});

io.use(async (socket, next) => {
	try {
		const id = socket.request.headers.id! as string
		const u = await authenticateUser(id)
		if (u === undefined) {
			next(new Error('unathorized'))
			return
		}
		next()
	} catch (error) {
		next(new Error('unathorized'))
	}
})

io.on('connection', (socket) => {
	socket.onAny(async (ev: string, arg: any) => {
		const event = ev.split('-').shift() || ev
		switch (event) {
			case "message":
				{
					const m: Message = arg
					try {
						const table = m.is_dispute ? 'disputes' : (m.is_report ? 'reports' : 'conversations')
						let res = await query()(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [m.id]) as Array<any>
						if (res.length !== 1) {
							return
						}
						const now = new Date()
						let _res = await query()(`INSERT INTO messages (
							content,
							type,
							owner_id,
							owner_type,
							is_read,
							is_dispute,
							is_report,
							sender_id,
							receiver_id,
							created_at,
							updated_at
						) values (
							?,?,?,?,?,?,?,?,?,?,?
						)`, [
							m.content,
							m.type,
							m.id,
							table,
							0,
							table === 'disputes' ? 1 : 0,
							table === 'reports' ? 1 : 0,
							m.sender?.id,
							m.receiver?.id,
							now,
							now
						])

						socket.emit(ev, { ...m, created_at: new Date() })
						socket.broadcast.emit(ev, { ...m, created_at: new Date() })
					} catch (error) {
						console.log(error)
					}
					break
				}
			case "notification": {
				const n: Notifications = arg
				try {
					let channel = 'notification'
					if (n.receiver_id) {
						const res = await query()("SELECT * FROM users WHERE id = ? LIMIT 1", [n.receiver_id]) as Array<User>
						if (res.length !== 1) {
							return
						}
						channel += '-' + res[0].id
					}
					socket.broadcast.emit(channel, n)
				} catch (error) {

				}
			}
		}
	})

	socket.on('notification', function (m: {}) {
		socket.broadcast.emit('notification', m)
	})
})

server.listen(process.env.PORT || 3000, () => {
	console.log('listening on *:', process.env.PORT || 3000);
});
