import {
    PiHouseLineDuotone,
    PiGearSixDuotone,
    PiVideoCameraDuotone,
    PiClipboardTextDuotone,
    PiScrollDuotone,
    PiInfoDuotone,
    PiUserDuotone,
    PiCalendarDuotone,
    PiFolderDuotone,
    PiFileTextDuotone,
    PiMonitorDuotone,
    PiUploadDuotone,
    PiUsersDuotone,
} from 'react-icons/pi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    settings: <PiGearSixDuotone />,
    video: <PiVideoCameraDuotone />,
    report: <PiClipboardTextDuotone />,
    document: <PiScrollDuotone />,
    info: <PiInfoDuotone />,
    user: <PiUserDuotone />,
    calendar: <PiCalendarDuotone />,
    folder: <PiFolderDuotone />,
    'file-text': <PiFileTextDuotone />,
    monitor: <PiMonitorDuotone />,
    'file-upload': <PiUploadDuotone />,
}

export default navigationIcon
