import { cloneElement } from 'react'
import type { ReactNode } from 'react'
import type { CommonProps } from '@/@types/common'

interface SplitProps extends CommonProps {
    content?: ReactNode
}

const Split = ({ children, content, ...rest }: SplitProps) => {
    return (
        <div className="grid lg:grid-cols-2 h-full p-6 bg-white dark:bg-gray-800">
            <div className="bg-no-repeat bg-cover py-6 px-16 flex-col justify-center items-center hidden lg:flex bg-primary rounded-3xl"></div>
            <div className="flex flex-col justify-center items-center ">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    <div className="mb-8">{content}</div>
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Split
