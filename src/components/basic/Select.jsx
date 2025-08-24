import React, { useEffect, useState } from 'react'
import {Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions} from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import {classNames, ClassNames} from "../../utils/index.js"

const Select = (props) => {
    const {options, value, placeholder, onChange} = props
    const [localOptions, setLocalOptions] = useState([])
    useEffect(()=>{
        setLocalOptions(options)
    },[options])
  return (
    <Combobox
    className={""}
    value={options.find((o)=>o.value === value)}
    onChange={(val)=>onChange(val)}
    as={"div"}
    >
        <div className=''>
            <ComboboxButton>
                <ComboboxInput
                placeholder={placeholder}
                onChange={(e)=>setLocalOptions(options.filter((op)=>op.label.includes(e.target.value)))}
                displayValue={(option)=>option?.label}
                />
            </ComboboxButton>
            <ComboboxButton>
                <ChevronUpDownIcon
                className=''
                aria-hidden="true"
                />
            </ComboboxButton>
            {
                localOptions.length>0 &&
                <ComboboxOptions className={""}>
                    {
                        localOptions.map((option)=>(
                            <ComboboxOption
                            key={option.value}
                            value={option}
                            className={({active})=>classNames(
                                "",
                                active?"":""
                            )}
                            >
                                {
                                    ({active, selected})=>(
                                        <>
                                            <span
                                            className={classNames(
                                                "",
                                                selected?"":""
                                            )}>
                                                {option.label}
                                            </span>
                                            {
                                                selected &&
                                                <span
                                                    className={classNames(
                                                    "",
                                                    active?"":""
                                                )}
                                                >
                                                    <CheckIcon
                                                    className=''
                                                    aria-hidden="true"
                                                    />
                                                </span>
                                            }
                                        </>
                                    )
                                }

                            </ComboboxOption>
                        ))
                    }

                </ComboboxOptions>
            }

        </div>
    </Combobox>
  )
}

export default Select
