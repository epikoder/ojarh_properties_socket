declare interface Message {
	id?: number
	content: string
	type: 'text' | 'image'
	is_dispute?: boolean
	is_report?: boolean
	owner_id?: number
	owner_type?: 'conversations' | 'disputes' | 'reports'
	receiver?: User
	sender?: User
}
declare interface Notifications {
	type: 'dispute' | 'message' | 'report'
	message: string
	receiver_id: string
}
declare interface User {
	id: string
	fname: string
	lname: string
	is_admin: boolean
}
