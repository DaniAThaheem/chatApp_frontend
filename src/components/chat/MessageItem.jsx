import React, { useState } from 'react'
import {
    ArrowDownTrayIcon,
    EllipsisVerticalIcon,
    MagnifyingGlassPlusIcon,
    PaperClipIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid"
import { classNames } from '../../utils'
import moment from 'moment'

const MessageItem = ({message, isOwnMessage, isGroupChatMessage, deleteChatMessage}) => {
    const [resizedImage, setResizedImage] = useState(null)
    const [openOption, setOpenOption] = useState(false)
  return (
    <>
      {
        resizedImage?
        <div className="">
            <XMarkIcon
            className=''
            onClick={()=>setResizedImage(null)}
            />
            <img 
            src={resizedImage} 
            alt="chat image" 
            />
        </div>
        :null
      }
      <div
      className={classNames(
        "",
        isOwnMessage?"":""
      )}
      >
        <img 
        src={message.sender?.avatar.url} 
        className={classNames(
            "",
            isOwnMessage?"":""
        )}
        alt="" 
        />
        <div
        onMouseLeave={()=>setOpenOption(false)}
        className={classNames(
            "",
            isOwnMessage?"":""
        )}
        >
            {isGroupChatMessage && !isOwnMessage?
            <p
            className={classNames(
                "",

            )}
            >
                {message.sender?.username}
            </p>
            :null
            }
            {
                message?.attachements?.length>0 ?
                <div>
                    {
                        isOwnMessage?
                        <button
                        className={``}
                        onClick={()=>setOpenOption(!openOption)}
                        >
                            <EllipsisVerticalIcon
                            className=''
                            />
                            <div
                            className={classNames("", openOption?"":"")}
                            >
                                <p
                                onClick={(e)=>{
                                    e.stopPropagation()
                                    const ok = confirm("Are you sure you want to delete the message")
                                    if(ok){
                                        deleteChatMessage(message)
                                    }
                                }}
                                role='button'
                                className=''
                                >
                                    <TrashIcon
                                    />
                                    Delete Message
                                </p>

                            </div>

                        </button>
                    :null}
                    <div
                    className={classNames(
                        "",
                        message.attachements?.length ===1?"":"",
                        message.attachements?.length ===2?"":"",
                        message.attachements?.length ===3?"":"",
                        message.content?"":""
                    )}
                    >
                        {
                            message.attachements?.map((file)=>(
                                <div
                                key={file._id}
                                className=''
                                >
                                    <button
                                    onClick={()=>setResizedImage(file.url)}
                                    className=''
                                    >
                                        <MagnifyingGlassPlusIcon
                                        className=''
                                        />
                                        <a
                                        href={file.url}
                                        download
                                        onClick={(e)=>e.stopPropagation()}
                                        >
                                            <ArrowDownTrayIcon
                                            title='download'
                                            className=''
                                            />

                                        </a>
                                    </button>
                                    <img
                                    className=''
                                    src={file.url}
                                    />

                                </div>
                            ))
                        }

                    </div>
                </div>
            :null}
            {
                message.content?
                <div>
                    {
                        isOwnMessage?
                        <button
                        className=''
                        onClick={()=>setOpenOption(!openOption)}
                        >
                            <EllipsisVerticalIcon
                            className=''
                            />
                            <div
                            className={classNames("", openOption?"":"")}
                            >
                                <p
                                onClick={(e)=>{
                                    e.stopPropagation()
                                    const ok = confirm("Are you sure you want to delete the message")
                                    if(ok){
                                        deleteChatMessage(message)
                                    }
                                }}
                                role='button'
                                className=''
                                >
                                    <TrashIcon
                                    />
                                    Delete Message
                                </p>
                            </div>
                        </button>
                        :null
                    }
                    <p
                    className=''
                    >
                        {message.content}
                    </p>
                </div>
                :null
            }
            <p
            className={classNames(
                "",
                isOwnMessage?"":""
            )}
            >
                {
                    message.attachements?.length>0?
                    <PaperClipIcon
                    className=''
                    />
                    :null
                }
                { moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}{""}
                    ago
            </p>
        </div>
      </div>
    </>
  )
}

export default MessageItem
