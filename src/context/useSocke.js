import {SocketContext} from "./SocketContext"
import { useContext } from "react"


const useSocket = ()=> useContext(SocketContext)

export {
    useSocket
}