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
        <Dialog as='div' className={``} onClose={handleClose}>
            <TransitionChild
            as={Fragment}
            enter=''
            enterFrom=''
            enterTo=''
            leave=''
            leaveFrom=''
            leaveTo=''
            >
                <div className='' />
            </TransitionChild>
            <div className="">
                <div className="">
                    <TransitionChild
                    as={Fragment}
                    enter=''
                    enterFrom=''
                    enterTo=''
                    leave=''
                    leaveFrom=''
                    leaveTo=''
                    >
                        <DialogPanel
                        className={``}
                        >
                            <div>
                                <div className="">
                                    <DialogTitle
                                    as='h3'
                                    className={``}
                                    >
                                        Create chat
                                    </DialogTitle>
                                    <button
                                    type='button'
                                    className=''
                                    onClick={()=>handleClose()}
                                    >
                                        <span className=''>Close</span>
                                        <XMarkIcon className='' aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Switch.Group as={`div`} className={``}>
                                    <Switch
                                        checked={isGroupChat}
                                        onChange={setIsGroupChat}
                                        className={classNames(
                                            isGroupChat?"":"",
                                            ""
                                        )}
                                    >
                                        <span
                                            className={classNames(
                                                isGroupChat?"":"",
                                                ""
                                            )}
                                            aria-hidden="true"
                                        />
                                        <Switch.Label as='span' className={``}>
                                            <span
                                                className={classNames(
                                                    "",
                                                    isGroupChat?"":""
                                                )}
                                            >
                                                Is it a group chat?
                                            </span>{" "}
                                        </Switch.Label>
                                    </Switch>
                                </Switch.Group> 
                                    {
                                        isGroupChat?
                                        <div>
                                            <Input
                                            placehodler={`Enter the group name`}
                                            value={groupName}
                                            onChange={(e)=>setGroupName(e.target.value)}
                                            />
                                        </div>
                                        :null
                                    }
                                    <div className=''>
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
                                        <div>
                                            <span className={classNames("")}>
                                                <UserGroupIcon className='' />
                                                Selected participants
                                            </span>{" "}
                                            <div
                                            className=''
                                            >
                                            {
                                                users.filter((user)=>groupParticipants.includes(user._id))
                                                .map((participant)=>(
                                                    <div
                                                    className=''
                                                    key={participant._id}
                                                    >
                                                        <img src={participant.avatar.url} alt="avatar" />
                                                        <p className=''>
                                                            {participant.username}
                                                        </p>
                                                        <XCircleIcon
                                                        className=''
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
                            <div className=''>
                                <Button
                                disabled={creatingChat}
                                severity='secondary'
                                onClick={handleClose}
                                className=""
                                >
                                    Close
                                </Button>
                                <Button
                                disabled={creatingChat}
                                onClick={isGroupChat? createNewGroupChat: createNewChat}
                                className=""
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
