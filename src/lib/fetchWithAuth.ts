export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, init)

    if (res.status === 401) {
        const data = await res.json()

        // Hiển thị lỗi và redirect
        if (typeof window !== 'undefined') {
            // Tránh call khi đang ở server side
            import('react-hot-toast').then(({ toast }) =>
                toast.error(data.error || 'Unauthorized', {
                    duration: 1000,
                    position: "top-right"
                })
            )

            setTimeout(() => {
                window.location.href = '/login'
            }, 1500)
        }
        throw new Error(data.error || 'Unauthorized')
    }

    return res
}
