import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiDownload } from 'react-icons/hi'
import {
    FaExpand,
    FaUserMd,
    FaFileAlt,
    FaCalendarAlt,
    FaCapsules,
    FaStickyNote,
} from 'react-icons/fa'
import ReactMuiTableListView from '@/components/shared/ReactMuiTableListView'
import usePrescription from '@/hooks/usePrescription'
import { useSessionUser } from '@/store/authStore'
import { Prescription } from '@/services/PrescriptionService'
import Dialog from '@/components/ui/Dialog'

const PrescriptionView = () => {
    const user = useSessionUser((state) => state.user)
    const { fetchPatientPrescriptions, prescriptionList, loading, error } =
        usePrescription({
            userId: user?.userId ? Number(user.userId) : undefined,
        })
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    useEffect(() => {
        if (user?.userId) {
            fetchPatientPrescriptions(currentPage, pageSize)
        }
    }, [user?.userId, currentPage, pageSize, fetchPatientPrescriptions])

    const handleDownload = (prescription: Prescription) => {
        if (prescription.prescriptionUrl) {
            const link = document.createElement('a')
            link.href = prescription.prescriptionUrl
            link.download =
                prescription.filename ||
                `prescription-${prescription.id}.${prescription.fileType?.split('/')[1] || 'png'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handlePreview = (imageUrl: string) => {
        setSelectedImage(imageUrl)
        setIsPreviewOpen(true)
    }

    // Format date as '8 June 2025'
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    // Badge color for prescription type
    const getTypeBadge = (type: string) => {
        const color =
            type === 'file'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
        return (
            <span
                className={`inline-block rounded px-2 py-1 text-xs font-semibold ${color}`}
            >
                {type.toUpperCase()}
            </span>
        )
    }

    const prescriptionCardTemplate = (prescription: Prescription) => (
        <Card className="p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-white w-full max-w-32xl mx-auto">
            <div className="flex flex-col md:flex-ow gap-6 md:gap-8 items-start md:items-center">
                {/* Image Preview Section */}
                {prescription.prescriptionUrl && (
                    <div className="relative w-full md:w-56 h-48 bg-gray-100 rounded-lg overflow-hidden group flex-shrink-0 flex items-center justify-center">
                        <img
                            src={prescription.prescriptionUrl}
                            alt={`Prescription ${prescription.id}`}
                            className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() =>
                                handlePreview(prescription.prescriptionUrl)
                            }
                        />
                        <Button
                            variant="plain"
                            size="sm"
                            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                            onClick={() =>
                                handlePreview(prescription.prescriptionUrl)
                            }
                        >
                            <FaExpand className="text-lg" />
                        </Button>
                    </div>
                )}
                {/* Details Section */}
                <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <FaFileAlt className="text-gray-400 mr-1" />
                        <span className="text-lg font-bold text-gray-800">
                            Prescription {prescription.id}
                        </span>
                        {getTypeBadge(prescription.prescriptionType)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm mb-2">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formatDate(prescription.createdAt)}</span>
                        <FaUserMd className="ml-4 mr-1" />
                        <span>Doctor ID: {prescription.doctorId}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-gray-500 text-xs mb-2">
                        <FaFileAlt className="mr-1" />
                        <span>{prescription.filename}</span>
                        <span className="ml-2">({prescription.fileType})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Button
                            size="sm"
                            variant="solid"
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                            onClick={() =>
                                handlePreview(prescription.prescriptionUrl)
                            }
                            disabled={!prescription.prescriptionUrl}
                        >
                            <FaExpand />
                            <span>Preview</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="solid"
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                            onClick={() => handleDownload(prescription)}
                            disabled={!prescription.prescriptionUrl}
                        >
                            <HiDownload />
                            <span>Download</span>
                        </Button>
                    </div>
                    {prescription.medicines && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-1">
                                <FaCapsules className="text-blue-400" />
                                <h4 className="font-semibold text-gray-800">
                                    Medicines
                                </h4>
                            </div>
                            <ul className="list-disc list-inside ml-2 text-gray-700">
                                {prescription.medicines.map(
                                    (medicine, index) => (
                                        <li key={index}>{medicine}</li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
                    {prescription.instructions && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <FaStickyNote className="text-yellow-500" />
                                <h4 className="font-semibold text-gray-800">
                                    Instructions
                                </h4>
                            </div>
                            <p className="text-gray-700 ml-2">
                                {prescription.instructions}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )

    const columns = [
        {
            Header: 'ID',
            accessor: 'id' as keyof Prescription,
        },
        {
            Header: 'Created At',
            accessor: 'createdAt' as keyof Prescription,
        },
        {
            Header: 'Doctor ID',
            accessor: 'doctorId' as keyof Prescription,
        },
    ]

    // Type guard to extract prescriptions array from possible API response shapes
    function extractPrescriptions(list: unknown): Prescription[] {
        if (Array.isArray(list)) return list as Prescription[]
        if (list && typeof list === 'object') {
            const obj = list as { prescriptions?: unknown; data?: unknown }
            if (Array.isArray(obj.prescriptions))
                return obj.prescriptions as Prescription[]
            if (Array.isArray(obj.data)) return obj.data as Prescription[]
        }
        return []
    }
    const prescriptions = extractPrescriptions(prescriptionList)

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-red-500 text-center">
                    <p>Error loading prescriptions: {error}</p>
                </div>
            </div>
        )
    }

    if (!user?.userId) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500 text-center">
                    <p>Please log in to view your prescriptions</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Prescriptions</h1>
                <p className="text-gray-500">
                    Your consultation notes with doctors
                </p>
            </div>
            <div className="space-y-4">
                <ReactMuiTableListView
                    tableTitle="My Prescriptions"
                    columns={columns}
                    data={prescriptions}
                    loading={loading}
                    enableTableListview={false}
                    enableCardView={true}
                    enableSearch={false}
                    enablePagination={true}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={prescriptions.length}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    cardTemplate={prescriptionCardTemplate}
                    viewTypeProp="card"
                />
            </div>
            {/* Image Preview Dialog */}
            <Dialog
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false)
                    setSelectedImage(null)
                }}
                width={800}
            >
                <div className="p-4">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Prescription Preview"
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default PrescriptionView
