import React, { useEffect, useRef, useState } from 'react'
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon} from "@heroicons/react/20/solid"
import {
  deleteMessage,
  getChatMessages,
  getUserChats,
  sendMessage
} from "../api/index.js"
import AddChatModal from "../components/chat/AddChatModal.jsx"
import MessageItem from "../components/chat/MessageItem.jsx"
import ChatItem from '../components/chat/ChatItem.jsx'
import Typing from '../components/chat/Typing.jsx'
import Input from "../components/basic/Input.jsx"
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from "../context/SocketContext.jsx"
import { LOCALSTORAGE, getChatObjectMetaData, classNames, requestHandler } from '../utils/index.js'


const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
const MESSAGE_DELETE_EVENT = "messageDeleted";
// const SOCKET_ERROR_EVENT = "socketError";


const Chat = () => {

  const {user, logout} = useAuth()
  const {socket} = useSocket()

  const currentChat = useRef(null)
  const typingTimeoutRef = useRef(null)

  const [isConnected, setIsConnected] = useState(false)

  const [openAddChat, setOpenAddChat] = useState(false)
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
 
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [unreadMessages, setUnreadMessages] = useState([])

  const [isTyping, setIsTyping] = useState(false)
  const [selfTyping, setSelfTyping] = useState(false)

  const [message, setMessage] = useState(false)
  const [localQuery, setLocalQuery] = useState(false)

  const [attachedFiles, setAttachedFiles] = useState(false)

  const updateChatLastMessage = (chatToUpdateId, message)=>{

    const chatToUpdate = chats.find((chat)=> chat._id === chatToUpdateId)
    chatToUpdate.lastMessage = message
    chatToUpdate.updatedAt = message.updatedAt

    setChats(
      [
        chatToUpdate,
        ...chats.filter((chat)=> chat._id !== chatToUpdateId)
      ]
    )
  }

  const updateChatLastMessageOnDeletion = async(chatToUpdateId, message)=>{
    const chatToUpdate = chats.find((chat)=> chat._id === chatToUpdateId)

    if(chatToUpdate.lastMessage?._id === message._id){
      await requestHandler(
      async()=> await getChatMessages(chatToUpdateId),
      null,
      (res)=>{
        const {data} = res

        chatToUpdate.lastMessage = data[0]
        setChats([...chats])  //here is a little confusion because wheather we have to add the chatToUpdate in the setChats
      },
      alert
    )
    }
    

  }

  const getChats = async()=>{
    await requestHandler(
      async()=> await getUserChats(),
      setLoadingChats,
      (res)=>{
        const {data} = res
        setChats(data || [])
      },
      alert
    )
  }

  const getMessages = async()=>{
    if(!currentChat.current?._id){
      return alert("No chat is selected")
    }

    if(!socket){
      return alert("Socket is not available")
    }

    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id)

    setUnreadMessages(
      unreadMessages.filter((msg)=>msg.chat !== currentChat.current?._id)
    )

    await requestHandler(
      async()=> await getChatMessages(currentChat.current._id ||""),
      setLoadingMessages,
      (res)=>{
        const {data} = res
        setMessages(data||[])
      },
      alert
    )
  }

  const sendChatMessage = async()=>{
    if(!currentChat.current?._id || !socket){
      return
    }

    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id)

    await requestHandler(
      async()=> await sendMessage(
        currentChat.current?._id,
        message,
        attachedFiles
      ),
      null,
      (res)=>{
        const {data} = res
        setAttachedFiles([])
        setMessage("")
        setMessages((prev)=>[data, ...prev])
        updateChatLastMessage(currentChat.current?._id, data)
      },
      alert
    )
  }

  const deleteChatMessage = async(message)=>{
    await requestHandler(
      async() => await deleteMessage(message.chat, message._id),
      null,
      (res)=>{
        setMessages((prev)=>
          prev.filter((msg)=>msg._id !== res.data._id)
        )
        updateChatLastMessage(message.chat, message)
        
      },
      alert
    )
  }

  const handleOnMessageChange = (e)=>{
    setMessage(e.target.value)
    if(!socket || !isConnected){
      return
    }
    if(!selfTyping){
      setSelfTyping(true)
      socket.emit(TYPING_EVENT, currentChat.current?._id)
    }
    if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current)
    }

    const timerLength = 3000

    typingTimeoutRef.current = setTimeout(() => {
        socket.emit(STOP_TYPING_EVENT, currentChat.current?._id)
        setSelfTyping(false)
    }, timerLength);

  }

  const onConnect = ()=>{
    setIsConnected(true)
  }

  const onDisconnect = ()=>{
    setIsConnected(false)
  }

  const handleOnSocketTyping = (chatId)=>{
    if(chatId !== currentChat.current?._id){
      return
    }

    setIsTyping(true)

  }

  const handleOnSocketStopTyping = (chatId)=>{
    if(chatId !== currentChat.current._id){
      return
    }

    setIsTyping(false)
  }

  const onMessageDelete = (message) =>{
    if(message?.chat !== currentChat.current?._id){
      setUnreadMessages((prev)=> prev.filter((msg)=>msg._id !== message._id))
    }
    else{
      setMessage((prev)=>prev.filter((msg)=> msg._id !== message._id))
    }
    updateChatLastMessageOnDeletion(message.chat, message)
  }
  
  const onMessageReceived = (message)=>{
    if(message?.chat !== currentChat.current?._id){
      setUnreadMessages((prev)=>[message, ...prev])
    }
    else{
      setMessages((prev)=>[message, ...prev])
    }
    updateChatLastMessage(message.chat, message)
  }

  const onNewChat = (chat) =>{
    setChats((prev)=>[chat, ...prev])

  }

  const onChatLeave = (chat)=>{
    if(chat._id !== currentChat.current?._id){
      currentChat.current = null
      LOCALSTORAGE.remove("currentChat")
    }
    setChats((prev)=> prev.filter((c)=>c._id !== chat._id))
  }

  const onGroupNameChange = (chat)=>{
    if(chat._id !== currentChat.current?._id){
      currentChat.current = chat
      LOCALSTORAGE.set("currentChat", chat)
    }
    setChats((prev)=>[
      ...prev.map((c)=>{
        if(c._id === chat._id){
          return chat
        }
        return c
      })
    ])
  }

  useEffect(()=>{
    getChats()

    const _currentChat = LOCALSTORAGE.get("currentChat")

    if(_currentChat){
      currentChat.current = _currentChat
      socket.emit(JOIN_CHAT_EVENT, currentChat.current._id) // confusion wheather to use _currentChat or currentCHat
      getMessages()
    }
  },[])

  useEffect(()=>{
    if(!socket) return

    socket.on(CONNECTED_EVENT, onConnect)
    socket.on(DISCONNECT_EVENT, onDisconnect)
    socket.on(TYPING_EVENT, handleOnSocketTyping)
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping)
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived)
    socket.on(NEW_CHAT_EVENT, onNewChat)
    socket.on(LEAVE_CHAT_EVENT, onChatLeave)
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange)
    socket.on(MESSAGE_DELETE_EVENT, onMessageDelete)

    return ()=>{
      socket.off(CONNECTED_EVENT, onConnect)
      socket.off(DISCONNECT_EVENT, onDisconnect)
      socket.off(TYPING_EVENT, handleOnSocketTyping)
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping)
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived)
      socket.off(NEW_CHAT_EVENT, onNewChat)
      socket.off(LEAVE_CHAT_EVENT, onChatLeave)
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange)
      socket.off(MESSAGE_DELETE_EVENT, onMessageDelete)
    }
  }, [socket, chats])




  return (
    <>
      <AddChatModal
        open={openAddChat}
        onClose={()=>setOpenAddChat(false)}
        onSuccess={()=>getChats()}
      />
      <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0">
        <div className="w-1/3 relative ring-white overflow-y-auto px-4">
          <div className="z-10 w-full sticky top-0 bg-dark py-4 flex justify-between items-center gap-4">
            <button
            type='button'
            className='focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-xl text-sm px-5 py-4 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 flex-shrink-0'
            onClick={logout}
            >
              Log Out
            </button>
            <Input
              placeholder="Search user of group"
              value={localQuery}
              onChange={(e)=>setLocalQuery(e.target.value.toLowerCase())}
            />
            <button
            onClick={()=>setOpenAddChat(true)}
            className='rounded-xl border-none bg-primary text-white py-4 px-5 flex flex-shrink-0'
            >
              + Add Chat
            </button>
          </div>
          {
            loadingChats?
            <div className="flex justify-center items-center h-[calc(100%-88px)]">
              <Typing/>
            </div>
            :
            [...chats].filter(
              (chat)=>
                localQuery?
                getChatObjectMetaData(chat, user).title.toLowerCase().includes(localQuery)
                :true
             ).map((chat)=>(
              <ChatItem
                chat={chat}
                onClick={(chat)=>{
                  if(currentChat.current?._id && currentChat.current?._id === chat._id) return
                  currentChat.current = chat
                  LOCALSTORAGE.set("currentChat", chat)
                  setMessage("")
                  getMessages()
                }}
                isActive={chat._id === currentChat.current?._id}
                unreadCount={unreadMessages.filter((msg)=>msg.chat === chat._id).length}
                key={chat._id}
                onChatDelete={(chatId)=>{
                  setChats((prev)=>prev.filter((chat)=>chat._id !== chatId))
                  if(chatId === currentChat.current?._id){
                    currentChat.current = null
                    LOCALSTORAGE.remove("currentChat")
                  }
                }}
              />
             ))
            
          }
        </div>
        <div className='w-2/3 border-l-[0.1px] border-secondary'>
          {
            currentChat.current && currentChat.current?._id?
            <>
              <div className="p-4 sticky top-0 bg-dark z-20 flex justify-between items-center w-full border-b-[0.1px0] border-secondary">
                <div className="flex justify-start items-center w-max gap-3">
                  {
                    currentChat.current?.isGroupChat?
                    <div className="w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap">
                      {
                        currentChat.current.participants
                        .slice(0, 3)
                        .map((participant, i)=>(
                          <img 
                          src={participant.avatar.url} 
                          alt="avatar"
                          className={classNames(
                            "w-9 h-9 border-[1px] border-white rounded-full absolute outline-4 outline-dark",
                            i===0?
                            "left-0 z-30"
                            :i===1?
                            "left-2 z-20"
                            :i===2?
                            "left-4 z-10"
                            :""
                          )}
                           />
                        ))
                      }
                    </div>
                    :
                    <img 
                    className='h-14 w-14 rounded-full flex flex-shrink-0 object-cover'
                    src={getChatObjectMetaData(currentChat.current, user).avatar} 
                    alt="" />
                  }
                  <div>
                    <p className="font-bold">
                      {getChatObjectMetaData(currentChat.current, user).title}
                    </p>
                    <small className="text-zinc-400">
                      {getChatObjectMetaData(currentChat.current, user).description}
                    </small>
                  </div>
                </div>
              </div>
              <div
              className={classNames(
                "p-8 overflow-y-auto flex flex-col-reverse gap-6 w-full",
                attachedFiles.length>0?
                "h-[calc(100vh-336px)]"
                :"h-[calc(100vh-176px)]"
              )}
              id='message-window'
              >
                {
                  loadingMessages?
                  <div className="flex justify-center items-center h-[calc(100%-88px)]">
                    <Typing/>
                  </div>
                  :
                  <>
                    {isTyping? <Typing/>:null}
                    {messages.map((message)=>(
                      <MessageItem
                      key={message._id}
                      isOwnMessage={message.sender._id === currentChat.current?._id}
                      isGroupChatMessage={currentChat.current?.isGroupChat}
                      message={message}
                      deleteChatMessage={deleteChatMessage}
                      />
                    ))}
                  </>
                }

              </div>
              {
                attachedFiles.length>0?
                <div className='grid gap-4 grid-cols-5 p-4 justify-start max-w-fit'>
                  {
                    attachedFiles.map((file, i)=>(
                      <div 
                      className="group w-32 h-32 relative aspect-square rounded-xl cursor-pointer"
                      key={i}
                      >
                        <div className='absolute inset-0 flex justify-center items-center w-full h-full bg-black/40 group-hover:opacity-0 transition-opacity ease-in-out duration-150'>
                          <button
                          onClick={()=>{
                            setAttachedFiles(attachedFiles.filter((_, index)=> index !==i))
                          }
                          }
                          className='absolute -top-2 -right-2'
                          >
                            <XCircleIcon className='h-6 w-6 text-white' />
                          </button>
                        </div>
                        <img 
                        src={URL.createObjectURL(file)} 
                        alt="attachment" 
                        />
                      </div>
                    ))
                  }
                </div>
                :null
              }
              <div className='sticky top-full p-4 flex justify-between items-center  w-full gap-2 border-t-[0.1px] border-secondary'>
                <Input
                id="attachments"
                type="file"
                max={5}
                value=""
                multiple
                hidden
                onChange ={(e)=>{
                  if(e.target.files){
                    setAttachedFiles([...e.target.files])
                  }
                }}
                />
                <label className='p-4 rounded-full bg-dark hover:bg-secondary' htmlFor="attachments">
                  <PaperClipIcon className='w-6 h-6 ' />
                </label>
                <Input
                placeholder={"Message"}
                value={message}
                onChange={handleOnMessageChange}
                onKeyDown = {
                  (e)=>{
                    if(e.key === "Enter"){
                      sendChatMessage()
                    }
                  }
                }
                />
                <button
                onClick={handleOnMessageChange}
                disabled={!message && attachedFiles.length<=0}
                className='p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50'
                >
                  <PaperAirplaneIcon className='w-6 h-6' />
                </button>
              </div>
            </>
            :
            <div className="w-full h-full flex justify-center items-center">
              No Chat Selected
            </div>
          }
        </div>
      </div>
    </>
  )
}

export default Chat
