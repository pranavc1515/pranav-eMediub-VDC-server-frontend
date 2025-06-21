import Container from '@/components/shared/Container'
import { Card } from '@/components/ui'

const Appointments = <T extends Record<string, any>>(props: T): JSX.Element => {
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
                </Card>
            </div>
        </Container>
    )
}

export default Appointments 