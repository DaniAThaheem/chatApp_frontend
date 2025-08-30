import React, { Fragment, useEffect, useState } from 'react'
import {Dialog, Switch, Transition, TransitionChild, DialogPanel, DialogTitle, } from "@headlessui/react"
import { UserGroupIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/20/solid"
import {createUserChat, createGroupChat, getAvailableUsers} from "../../api/index.js"
import {classNames, requestHandler} from "../../utils/index.js"
import Button from '../basic/Button.jsx'
import Input from '../basic/Input.jsx'
import Select from '../basic/Select.jsx'

const AddChatModal = ({open, onClose, onSuccess}) => {

    const [users, setUsers] = useState([])
    const [groupName, setGroupName] = useState("")
    const [isGroupChat, setIsGroupChat] = useState(false)
    const [groupParticipants, setGroupParticipants] = useState([])
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [creatingChat, setCreatingChat] = useState(false)


    const getUsers = async()=>{
        await requestHandler(
            async()=> await getAvailableUsers(),
            null,
            (res)=>{
                const {data} = res
                setUsers(data ||[])
            },
            alert
        )
    }

    const createNewChat = async()=>{
        if(!selectedUserId) return alert("Please select user")
        
        await requestHandler(
            async()=> await createUserChat(selectedUserId),
            setCreatingChat,
            (res)=>{
                const {data} = res
                if(res.status === 200){
                    alert("User chat already exists")
                    return
                }
                onSuccess(data)
                handleClose()
            },
            alert

        )
    }

    const createNewGroupChat = async()=>{
        if(!groupName) return alert("Group Name is required")
        if(!groupParticipants.length || groupParticipants.length<2){
            return alert("There must be at least 2 participants in the group")
        }
        await requestHandler(
            async()=> await createGroupChat({
                name:groupName,
                participants:groupParticipants
            }),
            setCreatingChat(),
            (res)=>{
                const {data} = res
                onSuccess(data)
                handleClose()
            },
            alert
        )

    }

    const handleClose = ()=>{
        setUsers([])
        setGroupName("")
        setIsGroupChat(false)
        setGroupParticipants([])
        setSelectedUserId("")
        onClose()
    }

    useEffect(()=>{
        if(!open) return
        getUsers()
    },[open])

  return (
    <Transition.Root as={Fragment} show={open}>
        <Dialog as='div' className={`relative z-10`} onClose={handleClose}>
            <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
            >
                <div className='flex inset-0 bg-black/50 bg-opacity-75 transition-opacity' />
            </TransitionChild>
            <div className="fixed inset-0 z-10 overflow-y-visible">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                    enterTo='opacity-100 translate-y-0 sm:scale-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                    leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                    >
                        <DialogPanel
                        className={` relat transform overflow-x-hidden rounded-lg bg-dark px-4 pb-4 pt-5  text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6`}
                        style={{
                            overflow:'inherit'
                        }}
                        >
                            <div>
                                <div className="flex justify-between items-center">
                                    <DialogTitle
                                    as='h3'
                                    className={`text-lg font-semibold leading-6 text-white`}
                                    >
                                        Create chat
                                    </DialogTitle>
                                    <button
                                    type='button'
                                    className='rounded-md bg-transparent text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2'
                                    onClick={()=>handleClose()}
                                    >
                                        <span className='sr-only'>Close</span>
                                        <XMarkIcon className='h-6 w-6' aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Switch.Group as={`div`} className={`flex items-center my-5`}>
                                    <Switch
                                        checked={isGroupChat}
                                        onChange={setIsGroupChat}
                                        className={classNames(
                                            isGroupChat?"bg-secondary":"bg-zinc-200",
                                            "relative outline-[1px] outline-white inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent  transition-colors duration-200 ease-in-out focus:ring-0"
                                        )}
                                    >
                                        <span
                                            className={classNames(
                                                isGroupChat?"translate-x-5 bg-success":"translate-x-0 bg-white",
                                                "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
                                            )}
                                            aria-hidden="true"
                                        />
                                        <Switch.Label as='span' className={`ml-3 text-sm`}>
                                            <span
                                                className={classNames(
                                                    "font-medium text-white",
                                                    isGroupChat?"":"opacity-40"
                                                )}
                                            >
                                                Is it a group chat?
                                            </span>{" "}
                                        </Switch.Label>
                                    </Switch>
                                </Switch.Group> 
                                    {
                                        isGroupChat?
                                        <div className='my-5'>
                                            <Input
                                            placehodler={`Enter the group name`}
                                            value={groupName}
                                            onChange={(e)=>setGroupName(e.target.value)}
                                            />
                                        </div>
                                        :null
                                    }
                                    <div className='my-5'>
                                        <Select
                                        placehodler={
                                            isGroupChat?
                                            "Select Group Participants..."
                                            :"Select a user to select"
                                        }
                                        value={isGroupChat?"":selectedUserId||""}
                                        options = {
                                            users.map((user)=>(
                                                {
                                                    label:user.username,
                                                    value:user._id
                                                }
                                            ))
                                        }
                                        onChange = {({value})=>{
                                            if(isGroupChat && !groupParticipants.includes(value)){
                                                setGroupParticipants([...groupParticipants, value])
                                            }
                                            else{
                                                setSelectedUserId(value)
                                            }
                                        }}
                                        />
                                    </div>
                                    {
                                        isGroupChat?
                                        <div className='my-5'>
                                            <span className={classNames("font-medium text-white inline-flex items-center")}>
                                                <UserGroupIcon className='h-5 w-5 mr-2' />
                                                Selected participants
                                            </span>{" "}
                                            <div
                                            className='flex justify-start items-center flex-wrap gap-2 mt-3'
                                            >
                                            {
                                                users.filter((user)=>groupParticipants.includes(user._id))
                                                .map((participant)=>(
                                                    <div
                                                    className='inline-flex bg-secondary rounded-full p-2 border-[1px] border-zinc-400 items-center gap-2'
                                                    key={participant._id}
                                                    >
                                                        <img src={participant.avatar.url} alt="avatar" className='h-6 w-6 rounded-full object-cover' />
                                                        <p className='text-white'>
                                                            {participant.username}
                                                        </p>
                                                        <XCircleIcon
                                                        className='w-6 h-6 hover:text-primary cursor-pointer'
                                                        role="button"
                                                        onClick={()=>
                                                            setGroupParticipants(
                                                                groupParticipants.filter((p)=>p !== participant._id)
                                                            )
                                                        }
                                                        />
                                                    </div>
                                                ))
                                            }

                                            </div>
                                        </div>:
                                        null
                                    }
                                </div>
                            <div className='mt-5 flex justify-between items-center gap-4 '>
                                <Button
                                disabled={creatingChat}
                                severity='secondary'
                                onClick={handleClose}
                                className="w-1/2"
                                >
                                    Close
                                </Button>
                                <Button
                                disabled={creatingChat}
                                onClick={isGroupChat? createNewGroupChat: createNewChat}
                                className="w-1/2"
                                >
                                    Create
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>

        </Dialog>

    </Transition.Root>
  )
}

export default AddChatModal
