import Container from '@/components/shared/Container'
import { Card, Notification } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import { useEffect } from 'react'
import { useTranslation } from '@/utils/hooks/useTranslation'

const Appointments = <T extends Record<string, any>>(props: T): JSX.Element => {
    const { t } = useTranslation()

    // Show informational notification when component loads
    useEffect(() => {
        toast.push(
            <Notification type="info" title={t('dashboard.comingSoon')}>
                {t('appointments.appointmentBookingUnderDevelopment')}
            </Notification>
        )
    }, [t])

    return (
        <Container className="py-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('appointments.bookAppointment')}
                </h1>
                <Card className="p-8">
                    <p className="text-gray-600">
                        {t('appointments.appointmentBookingUnderDevelopment')}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        <p>🔔 {t('appointments.appointmentNotifications')}</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>{t('appointments.appointmentConfirmed')}</li>
                            <li>{t('appointments.appointmentReminders')}</li>
                            <li>{t('appointments.doctorReschedules')}</li>
                            <li>{t('appointments.videoConsultationReady')}</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </Container>
    )
}

export default Appointments 