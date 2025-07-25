import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { PiUserDuotone, PiSignOutDuotone, PiUserCircleDuotone, PiGearDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import { useStoredUser } from '@/hooks/useStoredUser'
import { useState, useEffect } from 'react'
import UserService from '@/services/UserService'
import DoctorService from '@/services/DoctorService'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const _UserDropdown = () => {
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const loadUserFromStorage = useSessionUser((state) => state.loadUserFromStorage)
    
    // Use the useStoredUser hook to get data directly from localStorage
    const { 
        userName: storedUserName, 
        userEmail: storedEmail,
        profileImage: storedProfileImage,
        userAvatar: storedAvatar
    } = useStoredUser()
    
    // Ensure Zustand store is updated with localStorage data on component mount
    useEffect(() => {
        loadUserFromStorage()
    }, [loadUserFromStorage])
    
    // Combine data from both sources, preferring Zustand store if available
    // const userName = user.userName || storedUserName || 'User'
    // const email = user.email || storedEmail || ''
    const userImage = user.image || user.avatar || storedProfileImage || storedAvatar

    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
    }

    // Check if user is a doctor to conditionally show Settings
    const isDoctor = user.authority?.includes('doctor') || false

    // Define dropdown items conditionally based on user type
    const dropdownItemList: DropdownList[] = [
        // Only show Settings for non-doctor users
        ...(isDoctor ? [] : [{
            label: 'Settings',
            path: '/user/settings',
            icon: <PiGearDuotone />,
        }]),
    ]

    const avatarProps = {
        ...(userImage ? { src: userImage } : { icon: <PiUserDuotone /> }),
    }

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    useEffect(() => {
        // Determine if user is doctor or not
        const isDoctor = user.authority?.includes('doctor') || false
        if (isDoctor) {
            DoctorService.getProfile().then(res => {
                setName(res?.data?.fullName || '')
                setEmail(res?.data?.email || '')
                // Update user profile image in auth store if it has changed
                if (res?.data?.profilePhoto && res.data.profilePhoto !== user.avatar) {
                    setUser({
                        ...user,
                        avatar: res.data.profilePhoto,
                        image: res.data.profilePhoto
                    })
                }
            })
        } else {
            UserService.getProfileDetails().then(res => {
                setName(res?.data?.name || '')
                setEmail(res?.data?.email || '')
            })
        }
    }, [user, setUser])

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {name || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" to={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
