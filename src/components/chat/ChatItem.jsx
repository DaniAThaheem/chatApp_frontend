import React, { useState } from 'react'
import {
    EllipsisVerticalIcon,
    PaperClipIcon,
    TrashIcon,
} from "@heroicons/react"
import {requestHandler, classNames, getChatObjectMetaData} from "../../utils"
import moment from 'moment'
import {deleteOneOnOneChat} from "../../api/index.js"
import  {useAuth} from "../../context/AuthContext.jsx"
import GroupChatDetailModal from './GroupChatDetailModal.jsx'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
const ChatItem = ({chat, onChatDelete, isActive, unreadCount=0, onClick}) => {

  const {user} = useAuth()
  const [openOptions, setOpenOptions] = useState(false)
  const [openGroupInfo, setOpenGroupInfo] = useState(false)

  const deleteChat = async()=>{
    await requestHandler(
      async()=> await deleteOneOnOneChat(chat._id),
      null,
      ()=>{
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
      role=''
      onClick={()=> onClick(chat)}
      onMouseLeave={()=>setOpenOptions(false)}
      className={classNames(
        "",
        isActive?"":"",
        unreadCount>0?"":""
      )}
      >
        <button
        onClick={(e)=> {
          e.stopPropagation()
          setOpenOptions(!openOptions)}
        }
        className={classNames()}
        >
          <EllipsisVerticalIcon className=""/>
          <div className={classNames(
            "",
            openOptions?"":""
          )}>
            {
              chat.isGroupChat?
              <p
              onClick={(e)=>{
                e.stopPropagation()
                setOpenOptions(true)
              }}
              role='button'
              className=''
              >
                <InformationCircleIcon className=''/>
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
              className=''
              >
                <TrashIcon className=''/>
                Delete Chat
              </p>
            }

          </div>

        </button>
        <div className=''>
          {
            chat.isGroupChat?
            <div className=''>
              {
                chat.participants.slice(0, 3).map((p, i)=>(
                  <img 
                  key={p._id}
                  src={p.avatar.url} 
                  alt="avatar"
                  className={classNames(
                    "",
                    i===0?"":"",
                    i===2?"":"",
                    i===3?"":""
                  )} 
                  />
                ))
              }

            </div>
            :
            <img 
            src={getChatObjectMetaData(chat, user).avatar} 
            alt="avatar" />
          }

        </div>
        <div className=''>
          <p className="">
            {getChatObjectMetaData(chat, user).title} 
          </p>
          <div className=''>
            {chat.lastMessage && chat.lastMessage.attachments.length>0 ?
            <PaperClipIcon className="" />
            :
            null
            }
            <small className=''>
              {getChatObjectMetaData(chat, user).lastMessage} 
            </small>
          </div>
        </div>
        <div className="">
          <small className=''>
            {moment(chat.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}
          </small>
          {
            unreadCount <= 0? null
            :
            <span className=''>
              {unreadCount>9 ? "9+": unreadCount}
            </span>
          }
        </div>

      </div>
    </>
  )
}

export default ChatItem
