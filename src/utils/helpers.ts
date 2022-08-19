export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export const shortenString = (string: string, chars = 4): string => {
	if (string.length < chars * 2 + 3) return string
	return `${string.slice(0, chars)}...${string.slice(-chars)}`
}

export const getUnixTimeInSeconds = () => {
	return new Date().getTime() / 1000
}
