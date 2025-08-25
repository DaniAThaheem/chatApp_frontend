import axios from "axios";
import { LOCALSTORAGE } from "../utils";


const apiClient = axios.create(
    {
        baseURL:import.meta.env.VITE_SERVER_BASE_URI,
        withCredentials:true,
        timeout:120000
    }
)

//Setting up request middleware

apiClient.interceptors.request.use(
    function(config){
        const token = LOCALSTORAGE.get("token")
        config.headers.Authorization = `Bearer ${token}`
        return config
    },
    function(error){
       return Promise.reject(error)
    }
)

const registerUser = (data)=>{
    return apiClient.post("/users/register", data)
}

const loginUser = (data)=>{
    return apiClient.post("/users/login", data)
}

const logoutUser = ()=>{
    return apiClient.post("/users/logout")
}

const getChatMessages = (chatId)=>{
    return apiClient.get(`/messages/${chatId}`)
}

const sendMessage = (chatId, content, attachments)=>{
    const formData = new FormData()
    if(content){
        formData.append("content", content)
    }
    if(attachments){
        attachments.map((attachment)=>{
            formData.append("attachements", attachment)
        })
    }
    return apiClient.post(`/messages/${chatId}`, formData)
}

const deleteMessage = (chatId, messageId)=>{
    return apiClient.delete(`/messages/${chatId}/${messageId}`)
}

const getUserChats = ()=>{
    return apiClient.get("/chats/")
}

const getAvailableUsers = ()=>{
    return apiClient.get("/chats/users")
}

const createUserChat = (receiverId)=>{
    return apiClient.post(`/chats/c/${receiverId}`)
}

const createGroupChat = (data)=>{
    return apiClient.post(`/chats/group`, data)
}

const getGroupInfo = (chatId)=>{
    return apiClient.get(`/chats/group/${chatId}`)
}

const updateGroupName = (chatId, name)=>{
    return apiClient.patch(`/chats/group/${chatId}`, {name} )
}

const deleteGroup = (chatId)=>{
    return apiClient.delete(`/chats/group/${chatId}` )
}

const addParticipantToGroup = (chatId, participantId)=>{
    return apiClient.post(`/chats/group/${chatId}/${participantId}`)
}

const removeParticipantFromGroup = (chatId, participantId)=>{
    return apiClient.delete(`/chats/group/${chatId}/${participantId}`)
}

const deleteOneOnOneChat = (chatId)=>{
    return apiClient.delete(`/chats/remove/${chatId}`)
}


export {
    registerUser,
    loginUser,
    logoutUser,
    getChatMessages,
    sendMessage,
    deleteMessage,
    getUserChats,
    getAvailableUsers,
    createUserChat,
    createGroupChat,
    getGroupInfo,
    updateGroupName,
    deleteGroup,
    addParticipantToGroup,
    removeParticipantFromGroup,
    deleteOneOnOneChat
}