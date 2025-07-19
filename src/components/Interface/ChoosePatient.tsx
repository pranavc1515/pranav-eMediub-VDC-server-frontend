import { useState, useEffect } from 'react'
import { Card, Button, Avatar, Spinner, Notification } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import { motion } from 'framer-motion'
import { useAuth } from '@/auth'
import FamilyService, { type FamilyMember } from '@/services/FamilyService'
import { usePatientOnCallStore, type PatientOnCall } from '@/store/patientOnCallStore'
import { HiOutlineUser, HiOutlineUsers, HiOutlineCheck } from 'react-icons/hi'

interface ChoosePatientProps {
    onPatientSelected: (patient: PatientOnCall) => void
}

const ChoosePatient = ({ onPatientSelected }: ChoosePatientProps) => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedPatientId, setSelectedPatientId] = useState<number | string | null>(null)
    const { user } = useAuth()
    const { setSelectedPatient } = usePatientOnCallStore()

    useEffect(() => {
        fetchFamilyMembers()
    }, [])

    const fetchFamilyMembers = async () => {
        try {
            setLoading(true)
            const response = await FamilyService.getFamilyTree()
            
            if (response.status && response.data) {
                setFamilyMembers(response.data.familyTree)
            } else {
                console.warn('No family members found')
            }
        } catch (error) {
            console.error('Error fetching family members:', error)
            toast.push(
                <Notification type="warning" title="Warning">
                    Could not load family members. You can still proceed with your own consultation.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    const handlePatientSelect = (patient: PatientOnCall) => {
        setSelectedPatientId(patient.id)
        setSelectedPatient(patient)
        onPatientSelected(patient)
    }

    const handleMainUserSelect = () => {
        const mainUserPatient: PatientOnCall = {
            id: user.userId || user.patientId || 0,
            name: user.userName || 'Me',
            email: user.email,
            image: user.avatar,
            isMainUser: true,
        }
        handlePatientSelect(mainUserPatient)
    }

    const renderPatientCard = (patient: PatientOnCall, isMainUser: boolean = false) => {
        const isSelected = selectedPatientId === patient.id
        
        return (
            <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected 
                            ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border border-gray-200 hover:border-blue-300'
                    }`}
                    clickable
                    onClick={() => handlePatientSelect(patient)}
                >
                    <div className="flex items-center space-x-4 p-2">
                        <div className="relative">
                            <Avatar
                                size={60}
                                src={patient.image || undefined}
                                icon={<HiOutlineUser />}
                                className="bg-blue-100 text-blue-600"
                            />
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                                    <HiOutlineCheck className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {patient.name}
                                </h4>
                                {isMainUser && (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                        You
                                    </span>
                                )}
                            </div>
                            
                            {patient.relation_type && !isMainUser && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                    {patient.relation_type}
                                </p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                {patient.age && (
                                    <span>Age: {patient.age}</span>
                                )}
                                {patient.gender && (
                                    <span className="capitalize">{patient.gender}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        )
    }

    const familyMemberPatients: PatientOnCall[] = familyMembers.map(member => ({
        id: member.id,
        name: member.name,
        relation_type: member.relation_type,
        phone: member.phone,
        email: member.email,
        age: member.age,
        gender: member.gender,
        image: member.image,
        isMainUser: false,
    }))

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                            <HiOutlineUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Choose Patient for Consultation
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Select who this consultation is for
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner size="40px" />
                            <span className="ml-3 text-gray-600 dark:text-gray-400">
                                Loading family members...
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Main User */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    Your Account
                                </h3>
                                {renderPatientCard({
                                    id: user.userId || user.patientId || 0,
                                    name: user.userName || 'Me',
                                    email: user.email,
                                    image: user.avatar,
                                    isMainUser: true,
                                }, true)}
                            </div>

                            {/* Family Members */}
                            {familyMemberPatients.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-6 uppercase tracking-wide">
                                        Family Members ({familyMemberPatients.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {familyMemberPatients.map(patient => 
                                            renderPatientCard(patient)
                                        )}
                                    </div>
                                </div>
                            )}

                            {familyMemberPatients.length === 0 && !loading && (
                                <div className="text-center py-8">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <HiOutlineUsers className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No family members added yet.
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                        You can proceed with your own consultation.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedPatientId ? (
                                <span className="flex items-center space-x-2">
                                    <HiOutlineCheck className="w-4 h-4 text-green-500" />
                                    <span>Patient selected</span>
                                </span>
                            ) : (
                                'Please select a patient to continue'
                            )}
                        </div>
                        
                        <div className="flex space-x-3">
                            <Button
                                variant="solid"
                                onClick={handleMainUserSelect}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Continue with My Account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChoosePatient 