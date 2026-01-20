export const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return ''
    const n = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num
    if (isNaN(n)) return ''
    return n.toLocaleString('en-US')
}

export const parseNumber = (str) => {
    if (str === null || str === undefined || str === '') return 0
    if (typeof str === 'number') return str
    // Remove commas and convert to float/int
    const cleaned = str.replace(/,/g, '')
    const n = parseFloat(cleaned)
    return isNaN(n) ? 0 : n
}

export const getBankLabel = (bankCode) => {
    if (!bankCode) return ''
    try {
        const banks = JSON.parse(localStorage.getItem('supportedBanks') || '[]')
        const bank = banks.find(b => b.code === bankCode)
        return bank ? `${bank.name} (${bankCode})` : bankCode
    } catch (e) {
        console.error('Error parsing supportedBanks:', e)
        return bankCode
    }
}
