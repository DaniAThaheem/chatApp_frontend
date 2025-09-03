import React, {  useState } from 'react'
import {Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions} from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import {classNames} from "../../utils/index.js"

const Select = (props) => {
    const {options=[], value, placeholder, onChange} = props
    const [query, setQuery] = useState("")
    const filteredOptions = query === '' 
    ? options 
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
        )

    const handleInputChange = (event) => {
        console.log(event.target.value)
        setQuery(event.target.value)
    }
    const handleChange = (val)=>{
        console.log(val, "Changed val")
        onChange(val)
    }
  return (
    <Combobox
    className={`w-full ${props.className}`}
    value={options.find((o)=>o.value === value)}
    onChange={handleChange}
    as={"div"}
    >
        <div className='relative mt-2'>
            <ComboboxButton className={"w-full"}>
                <ComboboxInput
                placeholder={placeholder}
                onChange={handleInputChange}
                displayValue={(option)=>option?.label}
                className={"block w-full rounded-xl border-0 py-4 px-5 bg-secondary outline-[1px] outline-zinc-400 text-white font-light placeholder:text-white/70 focus:ring-[1px] focus:ring-white"}
                />
            </ComboboxButton>
            <ComboboxButton className={"absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"}>
                <ChevronUpDownIcon
                className='h-5 w-5 text-zinc-400'
                aria-hidden="true"
                />
            </ComboboxButton>
            {
                filteredOptions.length>0 &&
                <ComboboxOptions className={""}>
                    {
                        filteredOptions.map((option)=>(
                            <ComboboxOption
                            key={option.value}
                            value={option}
                            className={({active})=>classNames(
                                " cursor-pointer relative rounded-2xl select-none py-4 pl-3 pr-9 ",
                                active?"bg-dark text-white":"text-white"
                            )}
                            >
                                {
                                    ({active, selected})=>(
                                        <>
                                            <span
                                            className={classNames(
                                                "block truncate",
                                                selected?"font-semibold":""
                                            )}>
                                                {option.label}
                                            </span>
                                            {
                                                selected &&
                                                <span
                                                    className={classNames(
                                                    "absolute inset-y-0 right-0 flex items-center pr-4 ",
                                                    active?"text-white":"text-indigo-600"
                                                )}
                                                >
                                                    <CheckIcon
                                                    className='h-5 w-5'
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
