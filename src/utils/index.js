


//This takes the class names and combines them into a single string so that Tailwind can properly apply the styles
export const classNames = (...className)=>{
    return className.filter(Boolean).join(" ")
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
            console.log("Data in request handler", data)
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

export const getChatObjectMetaData = (chat, loggedInUser)=>{
    const lastMessage = chat.lastMessage?.content
    ? chat.lastMessage?.content
    : chat.lastMessage
    ? `${chat.lastMessage?.attachments?.length} attachment${
        chat.lastMessage.attachments.length > 1 ? "s" : ""
      }`
    : "No messages yet"

    if (chat.isGroupChat) {
    
    return {
      avatar: "",
      title: chat.name, 
      description: `${chat.participants.length} members in the chat`, 
      lastMessage: chat.lastMessage
        ? chat.lastMessage?.sender?.username + ": " + lastMessage
        : lastMessage,
    };
  } else {
    const participant = chat.participants.find(
      (p) => p._id !== loggedInUser?._id
    );
    console.log(participant)
    return {
      avatar: participant?.avatar.url, 
      title: participant?.username, 
      description: participant?.email, 
      lastMessage,
    };
  }

}