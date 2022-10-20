export const allowedOrigin = (origin: string): string => {
	return process.env.ORIGINS?.split(",")?.includes(origin) ? origin : ''
}