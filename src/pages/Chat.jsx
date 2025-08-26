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
      async()=> await getChats(),
      null,
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
      <div className="">
        <div className="">
          <div className="">
            <button
            type='button'
            className=''
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
            className=''
            >
              + Add Chat
            </button>
          </div>
          {
            loadingChats?
            <div className="">
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
        <div className=''>
          {
            currentChat.current && currentChat.current?._id?
            <>
              <div className="">
                <div className="">
                  {
                    currentChat.current?.isGroupChat?
                    <div className="">
                      {
                        currentChat.current.participants
                        .slice(0, 3)
                        .map((participant, i)=>(
                          <img 
                          src={participant.avatar.url} 
                          alt="avatar"
                          className={classNames(
                            "",
                            i===0?
                            ""
                            :i===1?
                            ""
                            :i===2?
                            ""
                            :""
                          )}
                           />
                        ))
                      }
                    </div>
                    :
                    <img 
                    className=''
                    src={getChatObjectMetaData(currentChat.current, user).avatar} 
                    alt="" />
                  }
                  <div>
                    <p className="">
                      {getChatObjectMetaData(currentChat.current, user).title}
                    </p>
                    <small className="">
                      {getChatObjectMetaData(currentChat.current, user).description}
                    </small>
                  </div>
                </div>
              </div>
              <div
              className={classNames(
                "",
                attachedFiles.length>0?
                ""
                :""
              )}
              id=''
              >
                {
                  loadingMessages?
                  <div className="">
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
                <div className=''>
                  {
                    attachedFiles.map((file, i)=>(
                      <div 
                      className=""
                      key={i}
                      >
                        <div>
                          <button
                          onClick={()=>{
                            setAttachedFiles(attachedFiles.filter((_, index)=> index !==i))
                          }
                          }
                          className=''
                          >
                            <XCircleIcon className='' />
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
              <div className=''>
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
                <label className='' htmlFor="attachments">
                  <PaperClipIcon className='' />
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
                className=''
                >
                  <PaperAirplaneIcon className='' />
                </button>
              </div>
            </>
            :
            <div className="">
              No Chat Selected
            </div>
          }
        </div>
      </div>
    </>
  )
}

export default Chat
