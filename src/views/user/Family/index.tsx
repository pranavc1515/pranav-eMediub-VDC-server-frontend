import { useState, useEffect } from 'react'
import {
    Card,
    Button,
    Badge,
    Avatar,
    Drawer,
    Notification,
} from '@/components/ui'
import { toast } from '@/components/ui/toast'
import { HiPlus, HiEye, HiPencil, HiTrash, HiUsers } from 'react-icons/hi2'
import { useSessionUser } from '@/store/authStore'
import FamilyService, {
    type FamilyMember,
    type FamilyTreeResponse,
    type AddFamilyMemberRequest,
    type UpdateFamilyMemberRequest,
    type RemoveFamilyMemberRequest,
} from '@/services/FamilyService'
import AddFamilyMemberForm from './components/AddFamilyMemberForm'
import EditFamilyMemberForm from './components/EditFamilyMemberForm'
import FamilyTreeCard from './components/FamilyTreeCard'
import { useTranslation } from '@/utils/hooks/useTranslation'

const Family = () => {
    const { t } = useTranslation()
    const { user } = useSessionUser()
    const [familyData, setFamilyData] = useState<FamilyTreeResponse | null>(
        null,
    )
    const [loading, setLoading] = useState(false)
    const [addDrawerOpen, setAddDrawerOpen] = useState(false)
    const [editDrawerOpen, setEditDrawerOpen] = useState(false)
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
        null,
    )
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)

    useEffect(() => {
        fetchFamilyTree()
    }, [])

    const fetchFamilyTree = async () => {
        try {
            setLoading(true)
            const data = await FamilyService.getFamilyTree()
            setFamilyData(data)
            
            // Show success notification only if there are family members
            if (data?.data?.familyTree?.length > 0) {
                toast.push(
                    <Notification type="success" title={t('family.familyTreeLoaded')}>
                        {t('family.familyTreeLoadedMessage', { count: data.data.familyTree.length })}
                    </Notification>,
                )
            }
        } catch (error) {
            toast.push(
                <Notification type="danger" title={t('family.loadingError')}>
                    {t('family.loadingErrorMessage')}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async (memberData: AddFamilyMemberRequest) => {
        try {
            await FamilyService.addFamilyMember(memberData)
            toast.push(
                <Notification type="success" title={t('common.success')}>
                    {t('family.familyMemberAdded')}
                </Notification>,
            )
            setAddDrawerOpen(false)
            fetchFamilyTree()
        } catch (error) {
            toast.push(
                <Notification type="danger" title={t('common.error')}>
                    {t('family.familyMemberError')}
                </Notification>,
            )
        }
    }

    const handleUpdateMember = async (
        memberData: UpdateFamilyMemberRequest,
    ) => {
        if (!selectedMember) return

        try {
            await FamilyService.updateFamilyMember(
                selectedMember.id,
                memberData,
            )
            toast.push(
                <Notification type="success" title={t('common.success')}>
                    {t('family.familyMemberUpdated')}
                </Notification>,
            )
            setEditDrawerOpen(false)
            setSelectedMember(null)
            fetchFamilyTree()
        } catch (error) {
            toast.push(
                <Notification type="danger" title={t('common.error')}>
                    {t('family.familyMemberUpdateError')}
                </Notification>,
            )
        }
    }

    const handleRemoveMember = async (relatedUserId: number) => {
        try {
            const requestData: RemoveFamilyMemberRequest = {
                userId: relatedUserId,
            }
            await FamilyService.removeFamilyMember(relatedUserId, requestData)
            toast.push(
                <Notification type="success" title={t('common.success')}>
                    {t('family.familyMemberRemoved')}
                </Notification>,
            )
            fetchFamilyTree()
        } catch (error) {
            toast.push(
                <Notification type="danger" title={t('common.error')}>
                    {t('family.familyMemberDeleteError')}
                </Notification>,
            )
        }
    }

    const openEditDrawer = (member: FamilyMember) => {
        setSelectedMember(member)
        setEditDrawerOpen(true)
    }

    const openViewDrawer = (member: FamilyMember) => {
        setSelectedMember(member)
        setViewDrawerOpen(true)
    }

    const openAddDrawer = (nodeUserId?: number) => {
        // Get user ID from auth store or localStorage as fallback
        const authUserId = user.userId ? parseInt(user.userId, 10) : null
        const storedUserId = localStorage.getItem('userId')
        const userIdFromStorage = storedUserId
            ? parseInt(storedUserId, 10)
            : null

        const finalNodeUserId = nodeUserId || authUserId || userIdFromStorage

        if (!finalNodeUserId) {
            toast.push(
                <Notification type="danger" title={t('family.authenticationRequired')}>
                    {t('family.loginRequiredMessage')}
                </Notification>,
            )
            return
        }

        setSelectedNodeId(finalNodeUserId)
        setAddDrawerOpen(true)
    }

    const renderFamilyMember = (member: FamilyMember, level: number = 0) => (
        <div key={member.id} className="mb-4">
            <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar
                            size={60}
                            src={member.image || undefined}
                            alt={member.name}
                            className="ring-2 ring-blue-100"
                        >
                            {!member.image &&
                                member.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {member.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge
                                    content={member.relation_type}
                                    className="bg-blue-100 text-blue-800"
                                />
                                <Badge
                                    content={member.gender}
                                    className="bg-purple-100 text-purple-800"
                                />
                                <Badge
                                    content={`${member.age} years`}
                                    className="bg-green-100 text-green-800"
                                />
                            </div>
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <p>📧 {member.email}</p>
                                <p>📞 {member.phone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                                                            <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<HiEye />}
                                    onClick={() => openViewDrawer(member)}
                                    className="text-blue-600 hover:bg-blue-50"
                                >
                                    {t('common.view')}
                                </Button>
                                                            <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<HiPencil />}
                                    onClick={() => openEditDrawer(member)}
                                    className="text-amber-600 hover:bg-amber-50"
                                >
                                    {t('common.edit')}
                                </Button>
                                                            <Button
                                    size="sm"
                                    variant="plain"
                                    icon={<HiTrash />}
                                    onClick={() => {
                                        if (
                                            confirm(
                                                t('family.confirmRemoveMember'),
                                            )
                                        ) {
                                            handleRemoveMember(member.id)
                                        }
                                    }}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    {t('common.remove')}
                                </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {member.relatives && member.relatives.length > 0 && (
                <div className="ml-8 mt-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {member.relatives.map((relative) =>
                        renderFamilyMember(relative, level + 1),
                    )}
                </div>
            )}
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">{t('family.loadingFamilyTree')}</div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('family.familyTree')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('family.manageFamilyMembers')}
                    </p>
                </div>
                <Button
                    variant="solid"
                    icon={<HiPlus />}
                    onClick={() => openAddDrawer()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {t('family.addFamilyMember')}
                </Button>
            </div>

            {/* Family Statistics */}
            {familyData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center">
                            <HiUsers className="text-2xl text-blue-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {t('family.totalMembers')}
                                </h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {familyData.data.familyTree?.length || 0}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Family Tree */}
            <Card className="p-6">
                                        <h2 className="text-xl font-semibold mb-4">{t('family.familyMembers')}</h2>
                {familyData?.data.familyTree &&
                familyData.data.familyTree.length > 0 ? (
                    <div className="space-y-4">
                        {familyData.data.familyTree.map((member) =>
                            renderFamilyMember(member),
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <HiUsers className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            {t('family.noFamilyMembers')}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('family.getStartedMessage')}
                        </p>
                        <div className="mt-6">
                            <Button
                                variant="solid"
                                icon={<HiPlus />}
                                onClick={() => openAddDrawer()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {t('family.addFamilyMember')}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add Family Member Drawer */}
            <Drawer
                isOpen={addDrawerOpen}
                onClose={() => setAddDrawerOpen(false)}
                title={t('family.addFamilyMember')}
                width={600}
                placement="right"
                closable
            >
                <AddFamilyMemberForm
                    onSubmit={handleAddMember}
                    onCancel={() => setAddDrawerOpen(false)}
                    nodeUserId={selectedNodeId}
                />
            </Drawer>

            {/* Edit Family Member Drawer */}
            <Drawer
                isOpen={editDrawerOpen}
                onClose={() => setEditDrawerOpen(false)}
                title={t('family.editFamilyMember')}
                width={600}
                placement="right"
                closable
            >
                {selectedMember && (
                    <EditFamilyMemberForm
                        member={selectedMember}
                        onSubmit={handleUpdateMember}
                        onCancel={() => setEditDrawerOpen(false)}
                    />
                )}
            </Drawer>

            {/* View Family Member Drawer */}
            <Drawer
                isOpen={viewDrawerOpen}
                onClose={() => setViewDrawerOpen(false)}
                title={t('family.familyMemberDetails')}
                width={600}
                placement="right"
                closable
            >
                {selectedMember && (
                    <FamilyTreeCard
                        member={selectedMember}
                        onClose={() => setViewDrawerOpen(false)}
                    />
                )}
            </Drawer>
        </div>
    )
}

export default Family
