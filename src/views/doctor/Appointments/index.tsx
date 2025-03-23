import { useState } from 'react'
import { 
    Card, 
    Button, 
    Avatar, 
    Tag, 
    Tabs,
    Input,
    Select,
    Table,
    Calendar,
    Badge
} from '@/components/ui'
import Container from '@/components/shared/Container'

interface Appointment {
    id: number
    patientName: string
    patientAge: number
    patientGender: string
    patientAvatar?: string
    date: string
    time: string
    duration: number
    type: 'video' | 'in-person'
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
    reason: string
    notes?: string
}

const Appointments = () => {
    const [activeTab, setActiveTab] = useState('upcoming')
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    
    // Mock appointment data
    const appointments: Appointment[] = [
        {
            id: 1,
            patientName: 'John Smith',
            patientAge: 45,
            patientGender: 'Male',
            date: '2023-05-02',
            time: '09:00 AM',
            duration: 30,
            type: 'video',
            status: 'scheduled',
            reason: 'Follow-up on hypertension medication'
        },
        {
            id: 2,
            patientName: 'Anna Johnson',
            patientAge: 35,
            patientGender: 'Female',
            date: '2023-05-02',
            time: '10:00 AM',
            duration: 30,
            type: 'video',
            status: 'scheduled',
            reason: 'Migraine consultation'
        },
        {
            id: 3,
            patientName: 'Michael Brown',
            patientAge: 60,
            patientGender: 'Male',
            date: '2023-05-02',
            time: '11:30 AM',
            duration: 45,
            type: 'video',
            status: 'scheduled',
            reason: 'Diabetes management review',
            notes: 'Patient will bring recent lab results'
        },
        {
            id: 4,
            patientName: 'Sarah Williams',
            patientAge: 28,
            patientGender: 'Female',
            date: '2023-05-03',
            time: '09:30 AM',
            duration: 30,
            type: 'video',
            status: 'scheduled',
            reason: 'Anxiety follow-up'
        },
        {
            id: 5,
            patientName: 'Robert Davis',
            patientAge: 52,
            patientGender: 'Male',
            date: '2023-05-03',
            time: '02:00 PM',
            duration: 30,
            type: 'video',
            status: 'scheduled',
            reason: 'Lower back pain consultation'
        },
        {
            id: 6,
            patientName: 'Jessica Martinez',
            patientAge: 41,
            patientGender: 'Female',
            date: '2023-04-28',
            time: '10:30 AM',
            duration: 30,
            type: 'video',
            status: 'completed',
            reason: 'Allergic rhinitis consultation',
            notes: 'Prescribed antihistamines, follow-up in 2 weeks'
        },
        {
            id: 7,
            patientName: 'Thomas Wilson',
            patientAge: 65,
            patientGender: 'Male',
            date: '2023-04-25',
            time: '11:00 AM',
            duration: 45,
            type: 'video',
            status: 'completed',
            reason: 'Annual checkup',
            notes: 'Patient is generally healthy. Recommended more physical activity.'
        },
        {
            id: 8,
            patientName: 'Emily Clark',
            patientAge: 33,
            patientGender: 'Female',
            date: '2023-04-27',
            time: '03:30 PM',
            duration: 30,
            type: 'video',
            status: 'no-show',
            reason: 'Headache consultation'
        }
    ]

    const filteredAppointments = appointments.filter(appointment => {
        // Filter by tab
        if (activeTab === 'upcoming' && ['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
            return false
        } else if (activeTab === 'past' && appointment.status === 'scheduled') {
            return false
        }
        
        // Filter by search term
        if (searchTerm === '') {
            return true
        }
        
        const searchLower = searchTerm.toLowerCase()
        return (
            appointment.patientName.toLowerCase().includes(searchLower) ||
            appointment.reason.toLowerCase().includes(searchLower)
        )
    })

    // Filter appointments for the selected day in calendar view
    const dateString = selectedDate.toISOString().split('T')[0]
    const appointmentsForSelectedDay = filteredAppointments.filter(
        appointment => appointment.date === dateString
    )

    const getAppointmentStatusColor = (status: Appointment['status']) => {
        switch(status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-600'
            case 'completed':
                return 'bg-emerald-100 text-emerald-600'
            case 'cancelled':
                return 'bg-red-100 text-red-600'
            case 'no-show':
                return 'bg-amber-100 text-amber-600'
            default:
                return 'bg-gray-100 text-gray-600'
        }
    }

    const columns = [
        {
            key: 'patient',
            title: 'Patient',
            dataIndex: 'patient',
            render: (_: any, record: Appointment) => (
                <div className="flex items-center">
                    <Avatar shape="circle" size={35} />
                    <div className="ml-2">
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-xs text-gray-500">
                            {record.patientAge} yrs, {record.patientGender}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'dateTime',
            title: 'Date & Time',
            dataIndex: 'dateTime',
            render: (_: any, record: Appointment) => (
                <div>
                    <div>{record.date}</div>
                    <div className="text-xs text-gray-500">
                        {record.time} ({record.duration} mins)
                    </div>
                </div>
            )
        },
        {
            key: 'type',
            title: 'Type',
            dataIndex: 'type',
            render: (_: any, record: Appointment) => (
                <Tag className={record.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}>
                    {record.type === 'video' ? 'Video Call' : 'In-Person'}
                </Tag>
            )
        },
        {
            key: 'reason',
            title: 'Reason',
            dataIndex: 'reason',
            render: (_: any, record: Appointment) => (
                <div className="truncate max-w-[200px]" title={record.reason}>
                    {record.reason}
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            dataIndex: 'status',
            render: (_: any, record: Appointment) => (
                <Tag className={getAppointmentStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Tag>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            dataIndex: 'actions',
            render: (_: any, record: Appointment) => (
                <div className="flex space-x-2 justify-end">
                    {record.status === 'scheduled' && (
                        <>
                            <Button 
                                size="sm" 
                                variant="solid"
                            >
                                Start Call
                            </Button>
                            <Button 
                                size="sm"
                            >
                                Reschedule
                            </Button>
                        </>
                    )}
                    {record.status === 'completed' && (
                        <Button 
                            size="sm"
                        >
                            View Notes
                        </Button>
                    )}
                </div>
            )
        }
    ]

    const dateCellRender = (value: Date) => {
        const dateStr = value.toISOString().split('T')[0]
        const dateAppointments = appointments.filter(appointment => appointment.date === dateStr)
        
        if (dateAppointments.length === 0) {
            return null
        }
        
        return (
            <div className="text-xs">
                {dateAppointments.slice(0, 3).map((appointment, index) => (
                    <div key={index} className="mb-1">
                        <Badge color={
                            appointment.status === 'scheduled' ? 'blue' :
                            appointment.status === 'completed' ? 'green' :
                            appointment.status === 'cancelled' ? 'red' : 'yellow'
                        } />
                        <span className="ml-1">{appointment.time}</span>
                    </div>
                ))}
                {dateAppointments.length > 3 && (
                    <div className="text-blue-500">+{dateAppointments.length - 3} more</div>
                )}
            </div>
        )
    }

    return (
        <Container className="h-full">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <h3>Appointments</h3>
                    <div className="flex space-x-2">
                        <Button
                            variant={viewMode === 'calendar' ? 'solid' : 'default'}
                            onClick={() => setViewMode('calendar')}
                        >
                            Calendar View
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'solid' : 'default'}
                            onClick={() => setViewMode('list')}
                        >
                            List View
                        </Button>
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex">
                        <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                            <Tabs.TabList>
                                <Tabs.TabNav value="upcoming">Upcoming</Tabs.TabNav>
                                <Tabs.TabNav value="past">Past</Tabs.TabNav>
                            </Tabs.TabList>
                        </Tabs>
                    </div>
                    <div className="flex">
                        <Input 
                            placeholder="Search appointments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<span className="text-gray-400">🔍</span>}
                        />
                    </div>
                </div>
                
                {viewMode === 'calendar' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Card>
                                <div className="p-4">
                                    <Calendar 
                                        value={selectedDate}
                                        onChange={(date: Date) => setSelectedDate(date)}
                                        dateCellRender={dateCellRender}
                                    />
                                </div>
                            </Card>
                        </div>
                        
                        <div>
                            <Card>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h5>
                                            {selectedDate.toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </h5>
                                        <Tag>{appointmentsForSelectedDay.length} appointments</Tag>
                                    </div>
                                    
                                    {appointmentsForSelectedDay.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No appointments scheduled for this day
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {appointmentsForSelectedDay.map(appointment => (
                                                <Card key={appointment.id} className="border shadow-sm">
                                                    <div className="p-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center">
                                                                <Avatar shape="circle" size={40} />
                                                                <div className="ml-2">
                                                                    <div className="font-medium">{appointment.patientName}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {appointment.patientAge} yrs, {appointment.patientGender}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Tag className={getAppointmentStatusColor(appointment.status)}>
                                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                            </Tag>
                                                        </div>
                                                        
                                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <div className="text-gray-500">Time</div>
                                                                <div>{appointment.time}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-500">Duration</div>
                                                                <div>{appointment.duration} minutes</div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <div className="text-gray-500">Reason</div>
                                                                <div>{appointment.reason}</div>
                                                            </div>
                                                        </div>
                                                        
                                                        {appointment.status === 'scheduled' && (
                                                            <div className="mt-3 flex justify-end space-x-2">
                                                                <Button size="sm" variant="solid">
                                                                    Start Call
                                                                </Button>
                                                                <Button size="sm">
                                                                    Reschedule
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Card>
                        <Table data={filteredAppointments} columns={columns} />
                    </Card>
                )}
            </div>
        </Container>
    )
}

export default Appointments 