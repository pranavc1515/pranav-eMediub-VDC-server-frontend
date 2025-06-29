import { Avatar, Badge, Button } from '@/components/ui'
import type { FamilyMember } from '@/services/FamilyService'

interface FamilyTreeCardProps {
    member: FamilyMember
    onClose: () => void
}

const FamilyTreeCard = ({ member, onClose }: FamilyTreeCardProps) => {
    return (
        <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="text-center">
                <Avatar
                    size={100}
                    src={member.image || undefined}
                    alt={member.name}
                    className="mx-auto ring-4 ring-blue-100 dark:ring-blue-900"
                >
                    {!member.image && member.name?.charAt(0).toUpperCase()}
                </Avatar>
                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                </h2>
                <Badge content={member.relation_type} className="mt-2 bg-blue-100 text-blue-800" />
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                        <p className="font-medium text-gray-900 dark:text-white">{member.age} years</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                        <p className="font-medium text-gray-900 dark:text-white">{member.gender}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {member.dob ? new Date(member.dob).toLocaleDateString() : 'Not provided'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Marital Status</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {member.marital_status || 'Not provided'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Contact Information
                </h3>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{member.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{member.phone}</p>
                    </div>
                </div>
            </div>

            {/* Professional & Physical Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Profession</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {member.profession || 'Not provided'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Diet</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {member.diet || 'Not provided'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {member.height ? `${member.height} cm` : 'Not provided'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {member.weight ? `${member.weight} kg` : 'Not provided'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Relatives Information */}
            {member.relatives && member.relatives.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                        Relatives ({member.relatives.length})
                    </h3>
                    <div className="space-y-3">
                        {member.relatives.map((relative) => (
                            <div key={relative.id} className="flex items-center space-x-3">
                                <Avatar
                                    size={40}
                                    src={relative.image || undefined}
                                    alt={relative.name}
                                >
                                    {!relative.image && relative.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {relative.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {relative.relation_type}
                                    </p>
                                </div>
                                <Badge content={`${relative.age} years`} className="bg-green-100 text-green-800" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FamilyTreeCard 