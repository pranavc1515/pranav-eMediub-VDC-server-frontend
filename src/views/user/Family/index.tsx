import { useState, useEffect, useMemo } from 'react'
import { HiPlus, HiPencil, HiTrash, HiPhone, HiMail, HiHeart, HiSearch, HiChartBar, HiUsers, HiExclamation } from 'react-icons/hi'
import { Card, Button, Avatar, Badge, Dialog, Spinner, Notification, Input, Tabs } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import FamilyService, { type FamilyMember, type FamilyStatistics } from '@/services/FamilyService'
import AddFamilyMemberForm from './components/AddFamilyMemberForm'
import EditFamilyMemberForm from './components/EditFamilyMemberForm'
import FamilyStatisticsCard from './components/FamilyStatisticsCard'
import EmergencyContactsView from './components/EmergencyContactsView'

const Family = () => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [emergencyContacts, setEmergencyContacts] = useState<FamilyMember[]>([])
    const [statistics, setStatistics] = useState<FamilyStatistics | null>(null)
    const [loading, setLoading] = useState(true)
    const [emergencyContactsLoading, setEmergencyContactsLoading] = useState(false)
    const [statisticsLoading, setStatisticsLoading] = useState(false)
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
    const [filterRelationship, setFilterRelationship] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [activeTab, setActiveTab] = useState<string>('all')

    const userId = localStorage.getItem('userId') || '1' // Default to '1' if not found

    useEffect(() => {
        fetchFamilyMembers()
        fetchStatistics()
    }, [])

    useEffect(() => {
        if (activeTab === 'emergency') {
            fetchEmergencyContacts()
        }
    }, [activeTab])

    // Trigger fetchFamilyMembers when searchQuery or filterRelationship changes
    useEffect(() => {
        fetchFamilyMembers()
    }, [searchQuery, filterRelationship])

    const fetchFamilyMembers = async () => {
        try {
            setLoading(true)
            let response
            
            console.log('Fetching family members with:', { searchQuery, filterRelationship, userId })
            
            // Use search if there's a search query
            if (searchQuery.trim()) {
                console.log('Using search API')
                response = await FamilyService.searchFamilyMembers(userId, searchQuery.trim())
            }
            // Use specific relationship endpoint if filter is selected
            else if (filterRelationship) {
                console.log('Using relationship filter API')
                response = await FamilyService.getFamilyMembersByRelationship(userId, filterRelationship)
            } 
            // Default: get all family members
            else {
                console.log('Using get all API')
                response = await FamilyService.getFamilyMembers(userId, undefined, true)
            }
            
            console.log('API Response:', response)
            
            if (response.success && Array.isArray(response.data)) {
                console.log('Setting family members:', response.data)
                setFamilyMembers(response.data)
            } else {
                console.log('No data or invalid response, setting empty array')
                setFamilyMembers([])
            }
        } catch (error) {
            console.error('Error fetching family members:', error)
            setFamilyMembers([])
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to fetch family members"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    const fetchEmergencyContacts = async () => {
        try {
            setEmergencyContactsLoading(true)
            const response = await FamilyService.getEmergencyContacts(userId)
            if (response.success && Array.isArray(response.data)) {
                setEmergencyContacts(response.data)
            }
        } catch (error) {
            console.error('Error fetching emergency contacts:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to fetch emergency contacts"
                />,
                { placement: 'top-center' }
            )
        } finally {
            setEmergencyContactsLoading(false)
        }
    }

    const fetchStatistics = async () => {
        try {
            setStatisticsLoading(true)
            const response = await FamilyService.getFamilyStatistics(userId)
            if (response.success) {
                setStatistics(response.data)
            }
        } catch (error) {
            console.error('Error fetching family statistics:', error)
            // Don't show error toast for statistics as it's not critical
        } finally {
            setStatisticsLoading(false)
        }
    }

    const handleAddMember = async (memberData: any) => {
        try {
            const response = await FamilyService.addFamilyMember({
                ...memberData,
                userId,
            })
            if (response.success) {
                toast.push(
                    <Notification
                        type="success"
                        title="Family member added successfully"
                    />,
                    { placement: 'top-center' }
                )
                setAddModalOpen(false)
                fetchFamilyMembers()
                fetchStatistics() // Refresh statistics after adding
            }
        } catch (error) {
            console.error('Error adding family member:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to add family member"
                />,
                { placement: 'top-center' }
            )
        }
    }

    const handleEditMember = async (memberData: any) => {
        if (!selectedMember?.id) return
        
        try {
            const response = await FamilyService.updateFamilyMember(selectedMember.id, memberData)
            if (response.success) {
                toast.push(
                    <Notification
                        type="success"
                        title="Family member updated successfully"
                    />,
                    { placement: 'top-center' }
                )
                setEditModalOpen(false)
                setSelectedMember(null)
                fetchFamilyMembers()
                fetchStatistics() // Refresh statistics after updating
                if (activeTab === 'emergency') {
                    fetchEmergencyContacts() // Refresh emergency contacts if on that tab
                }
            }
        } catch (error) {
            console.error('Error updating family member:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to update family member"
                />,
                { placement: 'top-center' }
            )
        }
    }

    const handleDeleteMember = async () => {
        if (!selectedMember?.id) return
        
        try {
            const response = await FamilyService.deleteFamilyMember(selectedMember.id)
            if (response.success) {
                toast.push(
                    <Notification
                        type="success"
                        title="Family member removed successfully"
                    />,
                    { placement: 'top-center' }
                )
                setDeleteModalOpen(false)
                setSelectedMember(null)
                fetchFamilyMembers()
                fetchStatistics() // Refresh statistics after deleting
                if (activeTab === 'emergency') {
                    fetchEmergencyContacts() // Refresh emergency contacts if on that tab
                }
            }
        } catch (error) {
            console.error('Error deleting family member:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to remove family member"
                />,
                { placement: 'top-center' }
            )
        }
    }

    const relationships = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Other']

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setFilterRelationship('') // Clear relationship filter when searching
        // fetchFamilyMembers will be called by useEffect
    }

    const handleFilterChange = (relationship: string) => {
        setFilterRelationship(relationship)
        setSearchQuery('') // Clear search when filtering
        // fetchFamilyMembers will be called by useEffect
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="40px" />
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family Members</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your family members and their information
                        </p>
                    </div>
                    <Button
                        variant="solid"
                        icon={<HiPlus />}
                        onClick={() => setAddModalOpen(true)}
                        className="shrink-0"
                    >
                        Add Family Member
                    </Button>
                </div>

                {/* Search */}
                <div className="mt-4 max-w-md">
                    <Input
                        placeholder="Search family members..."
                        prefix={<HiSearch className="text-lg" />}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Statistics */}
            <FamilyStatisticsCard statistics={statistics} loading={statisticsLoading} />

            {/* Tabs */}
            <Tabs value={activeTab} onChange={handleTabChange}>
                <Tabs.TabList>
                    <Tabs.TabNav value="all" icon={<HiUsers />}>
                        All Members
                    </Tabs.TabNav>
                    <Tabs.TabNav value="emergency" icon={<HiHeart />}>
                        Emergency Contacts
                    </Tabs.TabNav>
                    <Tabs.TabNav value="statistics" icon={<HiChartBar />}>
                        Statistics
                    </Tabs.TabNav>
                </Tabs.TabList>

                <Tabs.TabContent value="all">
                    {/* Filter for All Members tab */}
                    {!searchQuery && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant={filterRelationship === '' ? 'solid' : 'default'}
                                onClick={() => handleFilterChange('')}
                            >
                                All
                            </Button>
                            {relationships.map((rel) => (
                                <Button
                                    key={rel}
                                    size="sm"
                                    variant={filterRelationship === rel ? 'solid' : 'default'}
                                    onClick={() => handleFilterChange(rel)}
                                >
                                    {rel}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Family Members Content */}
                {familyMembers.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {searchQuery ? 'No matching family members' : 'No family members yet'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchQuery 
                                    ? `No family members found matching "${searchQuery}"`
                                    : 'Start by adding your first family member'
                                }
                            </p>
                            {!searchQuery && (
                                <Button
                                    variant="solid"
                                    icon={<HiPlus />}
                                    onClick={() => setAddModalOpen(true)}
                                >
                                    Add First Member
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {familyMembers.map((member) => (
                        <Card key={member.id} className="hover:shadow-lg transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar
                                            size="lg"
                                            src={member.profileImage || undefined}
                                            alt={`${member.firstName} ${member.lastName}`}
                                            className="ring-2 ring-gray-100 dark:ring-gray-700"
                                        >
                                            {`${member.firstName[0]}${member.lastName[0]}`}
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {member.firstName} {member.lastName}
                                            </h3>
                                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                {member.relationship}
                                            </Badge>
                                        </div>
                                    </div>
                                    {member.emergencyContact && (
                                        <div className="flex items-center text-red-500">
                                            <HiHeart className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium w-20">Age:</span>
                                        <span>{new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()} years</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium w-20">Gender:</span>
                                        <span>{member.gender}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium w-20">Blood:</span>
                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium dark:bg-red-900 dark:text-red-300">
                                            {member.bloodGroup}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <HiPhone className="w-4 h-4 mr-2" />
                                        <span>{member.phone}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <HiMail className="w-4 h-4 mr-2" />
                                        <span className="truncate">{member.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        icon={<HiPencil />}
                                        onClick={() => {
                                            setSelectedMember(member)
                                            setEditModalOpen(true)
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        icon={<HiTrash />}
                                        onClick={() => {
                                            setSelectedMember(member)
                                            setDeleteModalOpen(true)
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            </Tabs.TabContent>

            <Tabs.TabContent value="emergency">
                <EmergencyContactsView
                    emergencyContacts={emergencyContacts}
                    loading={emergencyContactsLoading}
                    onEdit={(member) => {
                        setSelectedMember(member)
                        setEditModalOpen(true)
                    }}
                />
            </Tabs.TabContent>

            <Tabs.TabContent value="statistics">
                <FamilyStatisticsCard statistics={statistics} loading={statisticsLoading} />
            </Tabs.TabContent>
            </Tabs>

            {/* Add Member Modal */}
            <Dialog
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onRequestClose={() => setAddModalOpen(false)}
            >
                <div className="max-w-md mx-auto">
                    <h4 className="text-xl font-semibold mb-4">Add Family Member</h4>
                    <AddFamilyMemberForm
                        onSubmit={handleAddMember}
                        onCancel={() => setAddModalOpen(false)}
                    />
                </div>
            </Dialog>

            {/* Edit Member Modal */}
            <Dialog
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false)
                    setSelectedMember(null)
                }}
                onRequestClose={() => {
                    setEditModalOpen(false)
                    setSelectedMember(null)
                }}
            >
                <div className="max-w-md mx-auto">
                    <h4 className="text-xl font-semibold mb-4">Edit Family Member</h4>
                    {selectedMember && (
                        <EditFamilyMemberForm
                            member={selectedMember}
                            onSubmit={handleEditMember}
                            onCancel={() => {
                                setEditModalOpen(false)
                                setSelectedMember(null)
                            }}
                        />
                    )}
                </div>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setSelectedMember(null)
                }}
                onRequestClose={() => {
                    setDeleteModalOpen(false)
                    setSelectedMember(null)
                }}
            >
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiTrash className="w-8 h-8 text-red-600" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Remove Family Member</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to remove{' '}
                            <span className="font-medium">
                                {selectedMember?.firstName} {selectedMember?.lastName}
                            </span>{' '}
                            from your family members? This action can be undone later.
                        </p>
                    </div>
                    <div className="flex justify-center space-x-3">
                        <Button
                            variant="plain"
                            onClick={() => {
                                setDeleteModalOpen(false)
                                setSelectedMember(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleDeleteMember}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove Member
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default Family 