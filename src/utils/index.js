


//This takes the class names and combines them into a single string so that Tailwind can properly apply the styles
export const classNames = (...className)=>{
    return className.filter(Boolean).join("")
}

export const isBrowser = typeof window !== "undefined"

export class LOCALSTORAGE{
    static get(key){
        if(!isBrowser)return
        const value = localStorage.getItem(key)
        if(value){
            try {
                return JSON.parse(value)
            } catch (err) {
                console.log(err)
                return null
            }
        }
        return null
    }
    static set(key, value){
        if(!isBrowser)return
        localStorage.setItem(key, JSON.stringify(value))
    }
    static remove(key){
        if(!isBrowser)return
        localStorage.removeItem(key)
    }
    static clear(){
        if(!isBrowser)return
        localStorage.clear()
    }
}

export const requestHandler = async(
    api,
    setIsLoading,
    onSuccess,
    onError
)=>{
    try {
        setIsLoading && setIsLoading(true)
        const response = await api()
        const {data} = response
        if(data.success){
            onSuccess(data)
        }
    } catch (error) {
        if([401, 403].includes(error?.response?.data?.statusCode)){
            localStorage.clear()
            if(isBrowser){
                window.location.href="/login"
            }
        }
        onError(error?.response?.data?.message || "Something went wrong")
    }
    finally{
        setIsLoading && setIsLoading(false)
    }
}