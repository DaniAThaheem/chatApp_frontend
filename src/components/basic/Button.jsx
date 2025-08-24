import React from 'react'
import { classNames } from '../../utils/index.js'

const Button = ({fullWidth, severity="primary", size="base", ...props}) => {
  return (
    <button
    className={classNames(
        "",
        fullWidth?"":"",
        severity==="secondary"?
        ""
        :
        severity==="danger"?
        ""
        :
        "",
        size==="small"?
        ""
        :
        "",
        props.className||""
    )}
    >
        {props.children}
    </button>
  )
}

export default Button
