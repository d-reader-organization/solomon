export const generateRandom = (max = 1, min = 0) => {
	return Math.floor(Math.random() * max + min)
}

export const formatCurrency = (value?: number, currency = '') => {
	const numberFormater = new Intl.NumberFormat('en-US', {
		style: 'decimal',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})

	const suffix = currency ? ` ${currency}` : ''
	if (!value) return '-.--' + suffix
	return numberFormater.format(value) + suffix
}
