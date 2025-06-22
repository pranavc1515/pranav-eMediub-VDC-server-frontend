import { Card, Avatar, Badge, Button } from '@/components/ui'
import { HiHeart, HiPhone, HiMail, HiPencil } from 'react-icons/hi'
import type { FamilyMember } from '@/services/FamilyService'

type EmergencyContactsViewProps = {
    emergencyContacts: FamilyMember[]
    loading: boolean
    onEdit: (member: FamilyMember) => void
}

const EmergencyContactsView = ({ emergencyContacts, loading, onEdit }: EmergencyContactsViewProps) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                        <div className="animate-pulse">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    if (emergencyContacts.length === 0) {
        return (
            <Card className="text-center py-8">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <HiHeart className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No emergency contacts</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Mark family members as emergency contacts to see them here
                    </p>
                </div>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact) => (
                <Card key={contact.id} className="p-4 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <Avatar
                                size="md"
                                src={contact.profileImage || undefined}
                                alt={`${contact.firstName} ${contact.lastName}`}
                                className="ring-2 ring-red-100 dark:ring-red-900"
                            >
                                {`${contact.firstName[0]}${contact.lastName[0]}`}
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {contact.firstName} {contact.lastName}
                                </h4>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                    {contact.relationship}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <HiHeart className="w-4 h-4 text-red-500" />
                            <Button
                                size="sm"
                                variant="plain"
                                icon={<HiPencil />}
                                onClick={() => onEdit(contact)}
                                className="text-gray-400 hover:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <HiPhone className="w-4 h-4 mr-2" />
                            <a 
                                href={`tel:${contact.phone}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                {contact.phone}
                            </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <HiMail className="w-4 h-4 mr-2" />
                            <a 
                                href={`mailto:${contact.email}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                            >
                                {contact.email}
                            </a>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Age: {new Date().getFullYear() - new Date(contact.dateOfBirth).getFullYear()}
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium dark:bg-red-900 dark:text-red-300">
                                {contact.bloodGroup}
                            </span>
                        </div>
                    </div>

                    {contact.medicalConditions && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Medical:</span> {contact.medicalConditions}
                            </p>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    )
}

export default EmergencyContactsView 