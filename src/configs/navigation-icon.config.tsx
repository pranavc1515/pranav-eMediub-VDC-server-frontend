import {
    PiHouseLineDuotone,
    PiGearSixDuotone,
    PiVideoCameraDuotone,
    PiClipboardTextDuotone,
    PiScrollDuotone,
    PiInfoDuotone,
} from 'react-icons/pi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    settings: <PiGearSixDuotone />,
    video: <PiVideoCameraDuotone />,
    report: <PiClipboardTextDuotone />,
    document: <PiScrollDuotone />,
    info: <PiInfoDuotone />,
}

export default navigationIcon
