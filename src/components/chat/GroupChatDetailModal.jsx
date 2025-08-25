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
                <div className=''/>
            </TransitionChild>
                <div className="">
                    <div className="">
                        <div className="">
                                
                        </div>
                    </div>
                </div>
                <TransitionChild
                    as={Fragment}
                    enter=''
                    enterFrom=''
                    enterTo=''
                    leave=''
                    leaveFrom=''
                    leaveTo=''
                >
                    <DialogPanel className={``}>
                        <div className="">
                            <div className="">
                                <div className="">
                                    <div className="">
                                        <button
                                        type='button'
                                        onClick={handleClose}
                                        className=''
                                        >
                                            <span className=''/>
                                            <span className=''>Close Panel</span>
                                            <XMarkIcon
                                            className=''
                                            aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="">
                                <div className="">
                                    <div className="">
                                        {groupDetails?.participants.slice(0,3).map((p)=>
                                            <img 
                                            className=''
                                            src={p.avatar.url}
                                            alt="avatar" />
                                        )}
                                        {groupDetails?.participants && groupDetails.participants?.length>3?
                                        <p>+{groupDetails.participants.length-3}</p>
                                        :null
                                        }
                                    </div>
                                    <div className=''>
                                        {renamingGroup?
                                        <div className=''>
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
                                        <div className=''>
                                            <h1 className=''>
                                                {groupDetails?.name}
                                            </h1>
                                            {
                                                groupDetails.admin === user._id?
                                                <button
                                                onClick={()=>setRenamingGroup(false)}
                                                >
                                                    <PencilIcon
                                                    className=''
                                                    />
                                                </button>
                                                :
                                                null
                                            }
                                        </div>
                                        }
                                        <p>
                                            Group . {groupDetails.participants.length}{""}
                                            participants
                                        </p>
                                    </div>
                                    <hr className='' />
                                    <div className=''>
                                        <p className=''>
                                            <UserGroupIcon className='' />{""}
                                            {groupDetails.participants.length} Participants
                                        </p>
                                        <div className=''>
                                            {groupDetails.participants.map((p)=>(
                                                <React.Fragment key={p._id}>
                                                    <div className=''>
                                                        <div className=''>
                                                            <img 
                                                            src={p.avatar.url} alt="avatar" 
                                                            />
                                                            <div className=''>
                                                                <p className=''>
                                                                    {
                                                                        groupDetails.admin === user._id?
                                                                        <span className=''>
                                                                          admin  
                                                                        </span>
                                                                        :null
                                                                    }
                                                                </p>
                                                                <small className=''>
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
                                                        <hr className=''/>
                                                </React.Fragment>
                                            ))}
                                            {
                                                groupDetails.admin === user._id?
                                                <div className=''>
                                                    {!addingParticipant?   
                                                        <Button
                                                        onClick ={()=>{setAddinParticipant(true)}}
                                                        >
                                                            <UserPlusIcon
                                                            className=''
                                                            />
                                                            Add Participant
                                                        </Button>
                                                    
                                                        :
                                                        <div>
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
                                                    severity=''
                                                    onClick ={()=>{
                                                    const ok = confirm("Are you sure do you want to delete this group?")
                                                    if(ok){
                                                    deleteGroupChat()
                                                    }
                                                    }}
                                                    >
                                                        <TrashIcon className=''/>
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
        </Dialog>
      </Transition.Root>
    </div>
  )
}

export default GroupChatDetailModal
