import { useToast } from './useToast'

export function useCommon() {
    const toast = useToast()

    const copyToClipboard = async (text) => {
        if (!text) return

        try {
            await navigator.clipboard.writeText(text)
            toast.success('已複製到剪貼簿')
        } catch (err) {
            console.error('Failed to copy detected:', err)
            toast.error('複製失敗')
        }
    }

    return {
        copyToClipboard
    }
}
