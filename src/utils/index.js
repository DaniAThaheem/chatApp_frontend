


//This takes the class names and combines them into a single string so that Tailwind can properly apply the styles
export const classNames = (...className)=>{
    return className.filter(Boolean).join("")
}