export const BUYING_ORDER_STATUS = {
    0: { label: '已過期', class: 'bg-secondary', text: 'text-white' },
    1: { label: '未付款', class: 'bg-warning', text: 'text-dark' },
    2: { label: '已付款', class: 'bg-info', text: 'text-dark' }, // Or text-white depending on contrast
    3: { label: '已轉點', class: 'bg-success', text: 'text-white' },
    10: { label: '退款中', class: 'bg-danger', text: 'text-white' },
    11: { label: '已退款', class: 'bg-dark', text: 'text-white' }
}

export const getBuyingOrderStatusInfo = (status) => {
    return BUYING_ORDER_STATUS[status] || { label: '未知', class: 'bg-secondary', text: 'text-white' }
}

export const SELLING_ORDER_STATUS = {
    0: { label: '已過期', class: 'bg-secondary', text: 'text-white' },
    1: { label: '已取消', class: 'bg-dark', text: 'text-white' },
    2: { label: '待收幣', class: 'bg-warning', text: 'text-dark' },
    3: { label: '已轉點', class: 'bg-info', text: 'text-dark' }, // Using info for "transferred" to distinguish
    4: { label: '待出款', class: 'bg-primary', text: 'text-white' },
    5: { label: '已出款', class: 'bg-success', text: 'text-white' }
}

export const getSellingOrderStatusInfo = (status) => {
    return SELLING_ORDER_STATUS[status] || { label: '未知', class: 'bg-secondary', text: 'text-white' }
}
