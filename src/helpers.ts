
export function asError(e: any | Error): Error {
	return e instanceof Error ? e : new Error(e)
}