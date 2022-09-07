export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @param string string to shorten
 * @param slice size of a slice
 * @returns short version of the string in a format '[slice]...[slice]'
 */
export const shortenString = (string: string, slice = 4): string => {
	if (string.length < slice * 2 + 3) return string
	return `${string.slice(0, slice)}...${string.slice(-slice)}`
}

export const getUnixTimeInSeconds = () => {
	return new Date().getTime() / 1000
}
