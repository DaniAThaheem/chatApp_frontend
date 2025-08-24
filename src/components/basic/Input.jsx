import React from 'react'
import { classNames } from '../../utils/index.js'

const Input = (props) => {
  return (
    <input 
    {...props}
    className={classNames(
        "",
        props.className||""
    )}
     />
  )
}

export default Input
