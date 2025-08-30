import React, { Fragment, useCallback, useEffect, useState } from 'react'
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react"
import {
    PencilIcon,
    TrashIcon,
    UserGroupIcon,
    UserPlusIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid"
import {
    addParticipantToGroup,
    deleteGroup,
    getAvailableUsers,
    getGroupInfo,
    removeParticipantFromGroup,
    updateGroupName
} from "../../api/index.js"

import {
    useAuth
} from "../../context/AuthContext.jsx"
import {
    requestHandler
} from '../../utils'
import Button from "../basic/Button.jsx"
import Input from "../basic/Input.jsx"
import Select from "../basic/Select.jsx"
const GroupChatDetailModal = ({open, onClose, chatId, onGroupDelete}) => {
    const {user} = useAuth()
    const [addingParticipant, setAddinParticipant] = useState(false)
    const [renamingGroup, setRenamingGroup] = useState(false)
    const [participantToBeAdded, setParticipantToBeAdded] = useState("")
    const [newGroupName, setNewGroupName] = useState("")
    const [groupDetails, setGroupDetails] = useState(null)
    const [users, setUser] = useState([])

    const handleGroupNameUpdate = async()=>{
        if(!newGroupName){
            return alert("Group name is required")
        }
        await requestHandler(
            async()=>await updateGroupName(chatId, newGroupName),
            null,
            (res)=>{
                const {data} = res
                setNewGroupName(data.name)
                setGroupDetails(data)
                setRenamingGroup(false)
            },
            alert
        )
    }
    const getUsers = async()=>{
        await requestHandler(
            async()=>await getAvailableUsers(),
            null,
            (res)=>{
                const {data} = res
                setUser(data)
            },
            alert
        )
    }
    const deleteGroupChat = async()=>{
        if(groupDetails.admin !== user._id){
            return alert("You are not admin")
        }
        await requestHandler(
            async()=> await deleteGroup(),
            null,
            ()=>{
                onGroupDelete()
                handleClose()
            },
            alert
        )
    }
    const addParticipant = async()=>{
        if(!participantToBeAdded){
            return alert("Participants are requierd")
        }

        await requestHandler(
            async()=>await addParticipantToGroup(chatId, participantToBeAdded),
            null,
            (res)=>{

                const data = {res}

                const updatedGroupDetail = {
                    ...groupDetails,
                    participants:data.participants
                }
                setGroupDetails(updatedGroupDetail)
                alert("Participants added")
            },
            alert
        )
    }
    const removeParticipant = async(participantId)=>{

        await requestHandler(
            async()=> await removeParticipantFromGroup(chatId, participantId),
            null,
            ()=>{
                const updatedGroupDetail = {
                    ...groupDetails,
                    participants:groupDetails.participants && groupDetails.participants.filter((p)=> p._id !== participantId) || []
                }
                setGroupDetails(updatedGroupDetail)
                alert("Participant remove ")
            },
            alert
        )
    }

    const fetchGroupInformation =useCallback( async() =>{
        await requestHandler(
            async() => await getGroupInfo(chatId),
            null,
            (res)=>{
                const {data} = res
                setGroupDetails(data)
                setNewGroupName(data?.name || "")
            },
            alert

        )
    },[chatId])
    const handleClose =()=>{
        onClose()
    }

    useEffect(()=>{
        if(!open)return
        fetchGroupInformation()
        getUsers()
    },[open, fetchGroupInformation])
  return (
    <div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as='div' className={` relative z-40`} onClose={handleClose}>
            <TransitionChild
                as={Fragment}
                enter='transform transition ease-in-out duration-500 sm:duration-700'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transform transition ease-in-out duration-500 sm:duration-700'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
            >
                <div className=' fixed inset-0 bg-black/50'/>
            </TransitionChild>
                <div className="fixed inset-0 overflow-hidden">
                    <div className=" absolute inset-0 overflow-hidden">
                        <div className=" pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <TransitionChild
                                as={Fragment}
                                enter='transform transition ease-in-out duration-500 sm:duration-700'
                                enterFrom=' translate-x-full'
                                enterTo='translate-x-0'
                                leave='transform transition ease-in-out duration-500 sm:duration-700'
                                leaveFrom='translate-x-0'
                                leaveTo='translate-x-full'
                            >
                                <DialogPanel className={` pointer-events-auto w-screen max-w-2xl`}>
                                    <div className=" flex h-full flex-col overflow-y-scroll">
                                        <div className="px-4 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                    type='button'
                                                    onClick={handleClose}
                                                    className='relative rounded-md bg-secondary text-zinc-400 hover:text-zinc-500 focus:outline-none'
                                                    >
                                                        <span className='absolute -inset-2.5'/>
                                                        <span className='sr-only'>Close Panel</span>
                                                        <XMarkIcon
                                                        className='h-6 w-6'
                                                        aria-hidden="true"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                            <div className="flex flex-col justify-center items-start">
                                                <div className="flex pl-16 justify-center items-center relative w-full h-max gap-3">
                                                    {groupDetails?.participants.slice(0,3).map((p)=>
                                                        <img 
                                                        className='w-24 h-24 -ml-16 rounded-full outline-4 outline-secondary'
                                                        src={p.avatar.url}
                                                        alt="avatar" />
                                                    )}
                                                    {groupDetails?.participants && groupDetails.participants?.length>3?
                                                    <p>+{groupDetails.participants.length-3}</p>
                                                    :null
                                                    }
                                                </div>
                                                <div className='w-full flex flex-col justify-center items-center text-center'>
                                                    {renamingGroup?
                                                    <div className='w-full flex justify-center items-center mt-5 gap-2'>
                                                        <Input
                                                        placeholder={"Enter new group name..."}
                                                        value={newGroupName}
                                                        onClick={(e)=>setNewGroupName(e)}
                                                        />
                                                        <Button
                                                        severity='primary'
                                                        onClick={handleGroupNameUpdate}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                        severity='secondary'
                                                        onClick = {()=> setRenamingGroup(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    :
                                                    <div className='w-full inline-flex justify-center items-center text-center mt-5'>
                                                        <h1 className='text-2xl font-semibold truncate-1'>
                                                            {groupDetails?.name}
                                                        </h1>
                                                        {
                                                            groupDetails.admin === user._id?
                                                            <button
                                                            onClick={()=>setRenamingGroup(false)}
                                                            >
                                                                <PencilIcon
                                                                className='w-5 h-5 ml-4'
                                                                />
                                                            </button>
                                                            :
                                                            null
                                                        }
                                                    </div>
                                                    }
                                                    <p className='mt-2 text-zinc-400 text-sm'>
                                                        Group . {groupDetails.participants.length}{""}
                                                        participants
                                                    </p>
                                                </div>
                                                <hr className='border-[0.1px] border-zinc-600 my-5 w-full' />
                                                <div className='w-full'>
                                                    <p className='inline-flex items-center'>
                                                        <UserGroupIcon className='' />{""}
                                                        {groupDetails.participants.length} Participants
                                                    </p>
                                                    <div className='h-6 w-6 mr-2'>
                                                        {groupDetails.participants.map((p)=>(
                                                            <React.Fragment key={p._id}>
                                                                <div className='flex justify-between  items-center w-full py-4'>
                                                                    <div className='flex justify-start items-start gap-3 w-full'>
                                                                        <img 
                                                                        src={p.avatar.url} 
                                                                        className='h-12 w-12 rounded-full'
                                                                        alt="avatar" 
                                                                        />
                                                                        <div >
                                                                            <p className='text-white font-semibold text-sm inline-flex items-center w-full'>
                                                                                {p.username}{""}
                                                                                {
                                                                                    groupDetails.admin === p._id?
                                                                                    <span className='ml-2 text-[10px] px-4 bg-success/10 border-[0.1px] border-success rounded-full text-success'>
                                                                                    admin  
                                                                                    </span>
                                                                                    :null
                                                                                }
                                                                            </p>
                                                                            <small className='text-zinc-400'>
                                                                                {p.email}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                            {groupDetails.admin === user._id?
                                                                            <div>
                                                                                <Button
                                                                                onClick={()=>{
                                                                                    const ok = confirm(
                                                                                        "Are sure you sure do you want to remove " + p.username +" ?"
                                                                                    )
                                                                                    if(ok){
                                                                                        removeParticipant(p._id||"")
                                                                                    }
                                                                                }}
                                                                                size="small"
                                                                                severity='danger'
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </div>
                                                                            :null
                                                                            }
                                                                        </div>
                                                                    <hr className='border-[0.1px] border-zinc-600 my-5 w-full'/>
                                                            </React.Fragment>
                                                        ))}
                                                        {
                                                            groupDetails.admin === user._id?
                                                            <div className='w-full my-5 flex flex-col justify-center items-center gap-4'>
                                                                {!addingParticipant?   
                                                                    <Button
                                                                    onClick ={()=>{setAddinParticipant(true)}}
                                                                    >
                                                                        <UserPlusIcon
                                                                        className='w-5 h-5 mr-1'
                                                                        />
                                                                        Add Participant
                                                                    </Button>
                                                                
                                                                    :
                                                                    <div className='w-full flex justify-center items-center gap-2'>
                                                                        <Select
                                                                        placeholder="Select a user to add"
                                                                        value={participantToBeAdded}
                                                                        options={users.map((user)=>(
                                                                        {
                                                                        label:user.username,
                                                                        value:user._id
                                                                        }
                                                                        ))}
                                                                        onChange ={({value})=>{
                                                                        setParticipantToBeAdded(value)
                                                                        }}
                                                                        />
                                                                        <Button
                                                                        onClick ={ ()=>addParticipant()}
                                                                        >
                                                                        +Add
                                                                        </Button>
                                                                        <Button
                                                                        severity="secondary"
                                                                        onChange={()=>{
                                                                        setAddinParticipant(false)
                                                                        setParticipantToBeAdded("")
                                                                        }}
                                                                        >
                                                                        Cancel
                                                                        </Button>
                                                                    </div>
                                                                }
                                                                <Button
                                                                fullWidth
                                                                severity='danger'
                                                                onClick ={()=>{
                                                                const ok = confirm("Are you sure do you want to delete this group?")
                                                                if(ok){
                                                                deleteGroupChat()
                                                                }
                                                                }}
                                                                >
                                                                    <TrashIcon className='w-5 h-5 mr-1'/>
                                                                    Delete Group
                                                                </Button>
                                                            
                                                            </div>
                                                            :null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}

export default GroupChatDetailModal
