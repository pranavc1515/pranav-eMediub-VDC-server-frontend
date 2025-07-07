import Container from '@/components/shared/Container'
import { Card, Notification } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import { useEffect } from 'react'

const Appointments = <T extends Record<string, any>>(props: T): JSX.Element => {
    // Show informational notification when component loads
    useEffect(() => {
        toast.push(
            <Notification type="info" title="Coming Soon">
                Appointment booking feature is under development. Stay tuned!
            </Notification>
        )
    }, [])

    return (
        <Container className="py-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Book Appointment
                </h1>
                <Card className="p-8">
                    <p className="text-gray-600">
                        This page is under development. You'll be able to book appointments with doctors here.
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        <p>🔔 You'll receive notifications when:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your appointment is confirmed</li>
                            <li>Appointment reminders are sent</li>
                            <li>Doctor reschedules or cancels</li>
                            <li>Video consultation is ready to start</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </Container>
    )
}

export default Appointments 