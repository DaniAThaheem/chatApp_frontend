import React, { useState } from 'react'
import {
    EllipsisVerticalIcon,
    PaperClipIcon,
    TrashIcon,
    InformationCircleIcon
} from "@heroicons/react/20/solid"
import {requestHandler, classNames, getChatObjectMetaData} from "../../utils"
import moment from 'moment'
import {deleteOneOnOneChat} from "../../api/index.js"
import  {useAuth} from "../../context/useAuth.js"
import GroupChatDetailModal from './GroupChatDetailModal.jsx'
const ChatItem = ({chat, onChatDelete, isActive, unreadCount=0, onClick}) => {

  const {user} = useAuth()
  const [openOptions, setOpenOptions] = useState("")
  const [openGroupInfo, setOpenGroupInfo] = useState(false)

  const deleteChat = async()=>{
    await requestHandler(
      async()=> await deleteOneOnOneChat(chat._id),
      null,
      ()=>{
        console.log(chat, "in chat items")
        onChatDelete(chat._id)
      },
      alert
    )
  }
  if(!chat)return
  return (
    <>
      <GroupChatDetailModal
      open={openGroupInfo}
      onClose={()=>setOpenGroupInfo(false)}
      chatId={chat._id}
      onGroupDelete={onChatDelete}
      />
      <div
      role='button'
      onClick={()=> onClick(chat)}
      onMouseLeave={()=>setOpenOptions(false)}
      className={classNames(
        "group p-4 my-2 flex justify-between gap-3 items-start cursor-pointer rounded-3xl hover:bg-secondary",
        isActive?"border-[1px] border-zinc-500 bg-secondary":"",
        unreadCount>0?"border-[1px] border-success bg-success/20 font-bold":""
      )}
      >
        <button
        onClick={(e)=> {
          e.stopPropagation()
          setOpenOptions(!openOptions)}
        }
        className={classNames("self-center p-1 relative")}
        >
          <EllipsisVerticalIcon className="h-4 w-4"/>
          <div className={classNames(
            "h-6 group-hover:w-fit  group-hover:opacity-100 w-fit opacity-10  transition-all ease-in-out duration-100  text-zinc-300",
            openOptions?"block":"hidden"
          )}>
            {
              chat.isGroupChat?
              <p
              onClick={(e)=>{
                e.stopPropagation()
                setOpenGroupInfo(true)
              }}
              role='button'
              className='p-2 w-full rounded-lg inline-flex items-center hover:bg-black text-[12px]'
              >
                <InformationCircleIcon className='h-8 w-8 mr-2 '/>
                About Group
              </p>
              :
              <p
              onClick={(e)=>{
                e.stopPropagation()
                const ok = confirm("Are you sure do you want to delete this chat?")
                if(ok){
                  deleteChat()
                }
              }}
              role='button'
              className='p-2 text-danger rounded-lg w-full inline-flex items-center hover:bg-black text-[12px]'
              >
                <TrashIcon className='h-8 w-8 mr-2'/>
                Delete Chat
              </p>
            }

          </div>

        </button>
        <div className='flex justify-center items-center flex-shrink-0'>
          {
            chat.isGroupChat?
            <div className='w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap'>
              {
                chat.participants.slice(0, 3).map((p, i)=>(
                  <img 
                  key={p._id}
                  src={p.avatar.url} 
                  alt="avatar"
                  className={classNames(
                    "w-8  h-8 border-[1px] border-white rounded-full absolute outline-4 outline-dark group-hover:outline-secondary",
                    i===0?"left-0 z-[3]"
                    :i===1?"left-2.5 z-[2]"
                    :i===2?"left-[18p] z-[1]":""
                  )} 
                  />
                ))
              }

            </div>
            :
            <img 
            src={getChatObjectMetaData(chat, user).avatar} 
            className='w-12 h-12 rounded-full'
            alt="avatar" />
          }

        </div>
        <div className='w-full'>
          <p className=" truncate-1">
            {getChatObjectMetaData(chat, user).title} 
          </p>
          <div className='w-full inline-flex items-center text-left'>
            {chat.lastMessage && chat.lastMessage.attachments.length>0 ?
            <PaperClipIcon className="text-white/50 h-3 w-3 mr-2 flex flex-shrink-0" />
            :
            null
            }
            <small className='text-white/50 truncate-1 text-sm text-ellipsis inline-flex items-center'>
              {getChatObjectMetaData(chat, user).lastMessage} 
            </small>
          </div>
        </div>
        <div className="flex text-white/50 h-full text-sm flex-col justify-between items-end">
          <small className='mb-2 inline-flex flex-shrink-0 w-max'>
            {moment(chat.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}
          </small>
          {
            unreadCount <= 0? null
            :
            <span className='bg-success h-6 w-6 aspect-square flex-shrink-0 text-white text-xs rounded-full inline-flex justify-center items-center'>
              {unreadCount>9 ? "9+": unreadCount}
            </span>
          }
        </div>

      </div>
    </>
  )
}

export default ChatItem
