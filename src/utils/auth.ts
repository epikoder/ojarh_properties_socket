import { query } from './db'

export const authenticateUser = async (id: string): Promise<User | undefined> => {
	try {
		const res = await query()("SELECT * FROM users WHERE id = ?", [id]) as Array<any>
		if (res.length !== 1) {
			return
		}
		return res[0]
	} catch (error) {
		return
	}
}