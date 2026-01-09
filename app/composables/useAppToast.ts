export const useAppToast = () => {
    const toast = useToast()
    const DURATION = 1000

    const success = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            icon: 'i-heroicons-check-circle',
            color: 'success',
            duration: DURATION
        })
    }

    const error = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            icon: 'i-heroicons-x-circle',
            color: 'error',
            duration: DURATION
        })
    }

    const info = (title: string, description?: string) => {
        toast.add({
            title,
            description,
            icon: 'i-heroicons-information-circle',
            color: 'primary',
            duration: DURATION
        })
    }

    return {
        success,
        error,
        info
    }
}
