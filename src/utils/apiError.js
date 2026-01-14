export const ERROR_CODES = {
    0: 'Success',
    '-1000': '無效參數',
    '-1001': '未授權',
    '-1002': '禁止訪問',
    '-1003': '資源不存在',
    '-1004': '內部錯誤',
    '-1005': '請求過於頻繁',
    '-2000': '無效的憑證',
    '-2001': '帳號未驗證',
    '-2002': '無效的驗證碼',
    '-2003': '驗證碼已過期',
    '-2004': '帳號已驗證',
    '-2005': '電子郵件已綁定',
    '-2006': '郵件發送失敗',
    '-2007': 'KYC 驗證未完成',
    '-3000': '用戶尚未綁定遊戲帳號',
    '-3001': '幣商無可供收點之遊戲帳號',
    '-3002': '用戶未綁定銀行帳號',
    '-3003': '用戶未綁定遊戲帳號',
    '-3004': '商戶未接受此訂單',
    '-4000': '遊戲帳號已綁定',
    '-4001': '遊戲帳號不存在',
    '-4002': '遊戲帳號已確認'
}

export const getErrorMessage = (code, defaultMsg = '未知的錯誤發生') => {
    // return ERROR_CODES[code] || defaultMsg
    return `${defaultMsg} [${code}]`;
}

export const handleApiError = (data) => {
    if (data && data.code !== 0) {
        return getErrorMessage(data.code, data.msg)
    }
    return null
}
