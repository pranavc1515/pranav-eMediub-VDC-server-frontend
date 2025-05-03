import { useState, useEffect } from 'react'
import {
    Card,
    Button,
    Input,
    Avatar,
    Table,
    Pagination,
    Tag,
    Notification,
    toast,
    Spinner,
    Badge,
    Tabs,
    FormContainer,
    FormItem,
    Select,
    Dialog,
} from '@/components/ui'
import Container from '@/components/shared/Container'
import axios from 'axios'
import {
    HiOutlineDownload,
    HiOutlineEye,
    HiOutlineSearch,
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineDocumentText,
    HiOutlineMap,
    HiOutlineClipboardList,
    HiOutlinePencil,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from 'react-icons/hi'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'

const { TabNav, TabList, TabContent } = Tabs

interface Medicine {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes: string
}

interface Prescription {
    id: string
    consultationId: string
    patientId: string
    doctorId: string
    prescriptionUrl: string
    prescriptionType: string
    s3Key: string
    filename: string
    fileType: string
    medicines: Medicine[] | null
    instructions: string | null
    createdAt: string
    updatedAt: string
}

const PrescriptionCard = ({
    prescription,
    onView,
}: {
    prescription: Prescription
    onView: (prescription: Prescription) => void
}) => {
    const handleViewClick = () => {
        onView(prescription)
    }

    const handleDownloadClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        window.open(prescription.prescriptionUrl, '_blank')
    }

    return (
        <motion.div
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
            whileHover={{ y: -5 }}
            onClick={handleViewClick}
        >
            <Card className="h-full">
                <div className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <Badge
                            className={
                                prescription.prescriptionType === 'custom'
                                    ? 'bg-blue-500'
                                    : 'bg-indigo-600'
                            }
                        >
                            {prescription.prescriptionType === 'custom'
                                ? 'Generated'
                                : 'Uploaded'}
                        </Badge>
                        <div className="text-sm text-gray-500 flex items-center">
                            <HiOutlineCalendar className="mr-1" />
                            {dayjs(prescription.createdAt).format(
                                'MMM D, YYYY',
                            )}
                        </div>
                    </div>

                    <div className="mb-3 flex-grow">
                        <h5 className="font-semibold mb-1 flex items-center">
                            <HiOutlineDocumentText className="mr-2 text-lg" />
                            Prescription {prescription.id.substring(0, 8)}...
                        </h5>
                        <div className="text-sm text-gray-600 mb-1 flex items-center">
                            <HiOutlineUser className="mr-2" />
                            Doctor ID: {prescription.doctorId}
                        </div>
                        <div className="text-sm text-gray-600 mb-1 flex items-center">
                            <HiOutlineClipboardList className="mr-2" />
                            {prescription.prescriptionType === 'custom'
                                ? `${prescription.medicines?.length || 0} medicines prescribed`
                                : `File: ${prescription.filename}`}
                        </div>
                    </div>

                    <div className="flex justify-between pt-3 border-t border-gray-100">
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiOutlineEye />}
                            onClick={handleViewClick}
                        >
                            View
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiOutlineDownload />}
                            onClick={handleDownloadClick}
                        >
                            Download
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(false)
    const [totalItems, setTotalItems] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)
    const [searchTerm, setSearchTerm] = useState('')
    const [userId, setUserId] = useState(localStorage.getItem('userId') || '')
    const [selectedPrescription, setSelectedPrescription] =
        useState<Prescription | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isUserIdModalOpen, setIsUserIdModalOpen] = useState(false)
    const [showPdfViewer, setShowPdfViewer] = useState(false)

    // Fetch prescriptions on component mount or when pagination changes
    useEffect(() => {
        if (userId) {
            fetchPrescriptions()
        } else {
            setIsUserIdModalOpen(true)
        }
    }, [currentPage, pageSize, userId])

    const fetchPrescriptions = async () => {
        if (!userId) {
            toast.push(
                <Notification
                    type="warning"
                    title="User ID is required to fetch prescriptions"
                />,
                { placement: 'top-center' },
            )
            setIsUserIdModalOpen(true)
            return
        }

        setLoading(true)
        try {
            const response = await axios.get(`/api/prescriptions/patient/me`, {
                params: {
                    userId,
                    page: currentPage,
                    limit: pageSize,
                },
            })

            if (response.data.success) {
                setPrescriptions(response.data.data)
                setTotalItems(response.data.count)
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error)
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to fetch prescriptions"
                />,
                { placement: 'top-center' },
            )
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handlePageSizeChange = (pageSize: number) => {
        setPageSize(pageSize)
        setCurrentPage(1)
    }

    const handleSearch = () => {
        // In a real implementation, you would add search functionality to filter prescriptions
        // For now, we'll just reset to the first page
        setCurrentPage(1)
        fetchPrescriptions()
    }

    const handleViewPrescription = (prescription: Prescription) => {
        setSelectedPrescription(prescription)
        setShowDetails(true)
    }

    const handleDownloadPrescription = (prescriptionUrl: string) => {
        window.open(prescriptionUrl, '_blank')
    }

    const handleCloseDetails = () => {
        setShowDetails(false)
        setSelectedPrescription(null)
        setShowPdfViewer(false)
    }

    const handleUserIdSubmit = () => {
        if (userId) {
            localStorage.setItem('userId', userId)
            fetchPrescriptions()
            setIsUserIdModalOpen(false)
        } else {
            toast.push(
                <Notification type="danger" title="User ID is required" />,
                { placement: 'top-center' },
            )
        }
    }

    const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserId(e.target.value)
    }

    const handleViewPdf = () => {
        if (selectedPrescription) {
            setShowPdfViewer(true)
        }
    }

    return (
        <Container>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="mb-1">My Prescriptions</h3>
                        <p className="text-gray-500">
                            Access and manage your medical prescriptions
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Button
                            variant="default"
                            icon={<HiOutlinePencil />}
                            onClick={() => setIsUserIdModalOpen(true)}
                        >
                            Change User ID
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <Input
                                size="sm"
                                placeholder="Search prescriptions"
                                prefix={<HiOutlineSearch className="text-lg" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                className="md:w-64"
                            />
                            <Button
                                size="sm"
                                variant="solid"
                                className="ml-2"
                                onClick={handleSearch}
                            >
                                Search
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant={
                                    viewMode === 'grid' ? 'solid' : 'default'
                                }
                                onClick={() => setViewMode('grid')}
                                icon={
                                    <HiOutlineCheckCircle
                                        className={
                                            viewMode === 'grid'
                                                ? 'text-white'
                                                : ''
                                        }
                                    />
                                }
                            >
                                Grid
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    viewMode === 'list' ? 'solid' : 'default'
                                }
                                onClick={() => setViewMode('list')}
                                icon={
                                    <HiOutlineClipboardList
                                        className={
                                            viewMode === 'list'
                                                ? 'text-white'
                                                : ''
                                        }
                                    />
                                }
                            >
                                List
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-60">
                            <Spinner size={40} />
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60">
                            <HiOutlineExclamationCircle className="text-5xl text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-4">
                                No prescriptions found
                            </p>
                            <Button
                                variant="solid"
                                onClick={() => setIsUserIdModalOpen(true)}
                            >
                                Update User ID
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {prescriptions.map((prescription) => (
                                    <PrescriptionCard
                                        key={prescription.id}
                                        prescription={prescription}
                                        onView={handleViewPrescription}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-end mt-6">
                                <Pagination
                                    currentPage={currentPage}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Details</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((prescription) => (
                                        <tr key={prescription.id}>
                                            <td>
                                                {dayjs(
                                                    prescription.createdAt,
                                                ).format('MMM D, YYYY')}
                                            </td>
                                            <td>
                                                <span
                                                    className={`inline-block capitalize ${prescription.prescriptionType === 'custom' ? 'bg-blue-500' : 'bg-indigo-500'} text-white rounded px-2 py-1`}
                                                >
                                                    {prescription.prescriptionType ===
                                                    'custom'
                                                        ? 'Generated'
                                                        : 'File Upload'}
                                                </span>
                                            </td>
                                            <td>
                                                {prescription.prescriptionType ===
                                                'custom'
                                                    ? `${prescription.medicines?.length || 0} medicines`
                                                    : prescription.filename}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="xs"
                                                        icon={<HiOutlineEye />}
                                                        variant="solid"
                                                        onClick={() =>
                                                            handleViewPrescription(
                                                                prescription,
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        icon={
                                                            <HiOutlineDownload />
                                                        }
                                                        variant="solid"
                                                        onClick={() =>
                                                            handleDownloadPrescription(
                                                                prescription.prescriptionUrl,
                                                            )
                                                        }
                                                    >
                                                        Download
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="flex justify-end mt-6">
                                <Pagination
                                    currentPage={currentPage}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <Dialog
                isOpen={isUserIdModalOpen}
                onClose={() => {
                    if (prescriptions.length > 0) {
                        setIsUserIdModalOpen(false)
                    }
                }}
            >
                <h5 className="mb-4">Enter User ID</h5>
                <div className="px-6 py-4">
                    <p className="mb-4 text-gray-600">
                        Please enter your User ID to fetch your prescriptions.
                    </p>
                    <FormContainer>
                        <FormItem label="User ID" labelClass="font-medium mb-2">
                            <Input
                                value={userId}
                                onChange={handleUserIdChange}
                                placeholder="e.g. user-123456"
                                autoFocus
                            />
                        </FormItem>
                    </FormContainer>
                </div>
                <div className="text-right px-6 py-3 border-t border-gray-200">
                    {prescriptions.length > 0 && (
                        <Button
                            size="sm"
                            variant="plain"
                            className="mr-2"
                            onClick={() => setIsUserIdModalOpen(false)}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="solid"
                        onClick={handleUserIdSubmit}
                    >
                        Submit
                    </Button>
                </div>
            </Dialog>

            <Dialog
                isOpen={showDetails && selectedPrescription !== null}
                onClose={handleCloseDetails}
                width={800}
            >
                {selectedPrescription && (
                    <div className="px-6 py-4">
                        <h4 className="mb-4">Prescription Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <span className="text-gray-500 flex items-center">
                                    <HiOutlineCalendar className="mr-2" />
                                    Date:
                                </span>
                                <p className="font-medium">
                                    {dayjs(
                                        selectedPrescription.createdAt,
                                    ).format('MMMM D, YYYY')}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 flex items-center">
                                    <HiOutlineDocumentText className="mr-2" />
                                    Type:
                                </span>
                                <p className="font-medium capitalize">
                                    {selectedPrescription.prescriptionType}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 flex items-center">
                                    <HiOutlineUser className="mr-2" />
                                    Doctor ID:
                                </span>
                                <p className="font-medium">
                                    {selectedPrescription.doctorId}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 flex items-center">
                                    <HiOutlineMap className="mr-2" />
                                    Consultation ID:
                                </span>
                                <p className="font-medium">
                                    {selectedPrescription.consultationId}
                                </p>
                            </div>
                        </div>

                        <Tabs defaultValue="details">
                            <TabList>
                                <TabNav value="details">
                                    Prescription Details
                                </TabNav>
                                {selectedPrescription.prescriptionUrl && (
                                    <TabNav value="view">View PDF</TabNav>
                                )}
                            </TabList>
                            <div className="mt-4">
                                <TabContent value="details">
                                    {selectedPrescription.prescriptionType ===
                                        'custom' &&
                                    selectedPrescription.medicines ? (
                                        <>
                                            <h5 className="mb-4 font-semibold">
                                                Medicines
                                            </h5>
                                            <div className="space-y-4 mb-6">
                                                {selectedPrescription.medicines.map(
                                                    (medicine, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-50 p-4 rounded-lg"
                                                        >
                                                            <h6 className="mb-2 font-semibold">
                                                                {medicine.name}
                                                            </h6>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Dosage:
                                                                    </span>{' '}
                                                                    {
                                                                        medicine.dosage
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Frequency:
                                                                    </span>{' '}
                                                                    {
                                                                        medicine.frequency
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Duration:
                                                                    </span>{' '}
                                                                    {
                                                                        medicine.duration
                                                                    }
                                                                </div>
                                                                {medicine.notes && (
                                                                    <div className="md:col-span-2">
                                                                        <span className="text-gray-500">
                                                                            Notes:
                                                                        </span>{' '}
                                                                        {
                                                                            medicine.notes
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {selectedPrescription.instructions && (
                                                <div>
                                                    <h5 className="mb-2 font-semibold">
                                                        Instructions
                                                    </h5>
                                                    <p className="bg-gray-50 p-4 rounded-lg text-sm">
                                                        {
                                                            selectedPrescription.instructions
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6">
                                            <p className="mb-4">
                                                View or download the
                                                prescription file
                                            </p>
                                        </div>
                                    )}
                                </TabContent>
                                {selectedPrescription.prescriptionUrl && (
                                    <TabContent value="view">
                                        <div className="h-96 overflow-hidden relative">
                                            <iframe
                                                src={
                                                    selectedPrescription.prescriptionUrl
                                                }
                                                className="w-full h-full border-0"
                                                title="Prescription PDF"
                                            />
                                        </div>
                                    </TabContent>
                                )}
                            </div>
                        </Tabs>
                    </div>
                )}
                <div className="px-6 py-3 border-t border-gray-200 flex justify-between">
                    <Button variant="plain" onClick={handleCloseDetails}>
                        Close
                    </Button>
                    {selectedPrescription && (
                        <Button
                            variant="solid"
                            icon={<HiOutlineDownload />}
                            onClick={() =>
                                handleDownloadPrescription(
                                    selectedPrescription.prescriptionUrl,
                                )
                            }
                        >
                            Download Prescription
                        </Button>
                    )}
                </div>
            </Dialog>
        </Container>
    )
}

export default Prescriptions
