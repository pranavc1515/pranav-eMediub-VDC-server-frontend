import { useState, useEffect } from 'react'
import {
    Card,
    Button,
    Input,
    FormItem,
    FormContainer,
    Form,
    Upload,
    Notification,
    Dialog,
    Spinner,
    DatePicker,
    Drawer,
} from '@/components/ui'
import toast from '@/components/ui/toast'
import ReportsService, { ReportData, UploadReportRequest } from '@/services/ReportsService'
import { HiOutlineCloudUpload, HiOutlineEye, HiOutlineTrash, HiOutlineDocument, HiOutlinePlus } from 'react-icons/hi'
import { format } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Validation schema
const uploadReportSchema = z.object({
    report_date: z.date({
        required_error: 'Report date is required',
    }),
    doctor_name: z.string().min(1, 'Doctor name is required'),
    files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
})

type UploadReportFormData = z.infer<typeof uploadReportSchema>

const UserReports = () => {
    const [reports, setReports] = useState<ReportData[]>([])
    const [loading, setLoading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
    const [uploadFiles, setUploadFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<UploadReportFormData>({
        resolver: zodResolver(uploadReportSchema),
        defaultValues: {
            report_date: new Date(),
            doctor_name: '',
            files: [],
        },
    })

    // Fetch reports on component mount
    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        setLoading(true)
        try {
            const response = await ReportsService.getReports()
            if (response.status && response.data) {
                setReports(response.data)
            }
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch reports
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }

    const handleUploadFiles = (files: File[]) => {
        setUploadFiles(files)
        setValue('files', files)
    }

    const onSubmitUpload = async (data: UploadReportFormData) => {
        setUploading(true)
        try {
            // Get userId from localStorage
            const userId = localStorage.getItem('userId') || localStorage.getItem('user')
            let targetUserId: number | undefined

            if (userId) {
                // Try to parse as number first, then as JSON if it's a user object
                try {
                    targetUserId = parseInt(userId, 10)
                    if (isNaN(targetUserId)) {
                        const userObj = JSON.parse(userId)
                        targetUserId = userObj.userId || userObj.id
                    }
                } catch {
                    targetUserId = undefined
                }
            }

            const uploadData: UploadReportRequest = {
                report_pdf: data.files,
                report_date: format(data.report_date, 'yyyy-MM-dd'),
                doctor_name: data.doctor_name,
                target_user_id: targetUserId,
            }

            const response = await ReportsService.uploadReports(uploadData)
            
            if (response.status) {
                toast.push(
                    <Notification type="success" title="Success">
                        {response.message}
                    </Notification>,
                    { placement: 'top-center' }
                )
                
                // Reset form and close modal
                reset()
                setUploadFiles([])
                setShowUploadModal(false)
                
                // Refresh reports list
                fetchReports()
            } else {
                throw new Error(response.message)
            }
        } catch (error: any) {
            toast.push(
                <Notification type="danger" title="Error">
                    {error.message || 'Failed to upload report'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setUploading(false)
        }
    }

    const handleViewReport = (report: ReportData) => {
        setSelectedReport(report)
        setShowViewModal(true)
    }

    const handleDeleteReport = async (reportId: number) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                const response = await ReportsService.deleteReport(reportId)
                if (response.status) {
                    toast.push(
                        <Notification type="success" title="Success">
                            Report deleted successfully
                        </Notification>,
                        { placement: 'top-center' }
                    )
                    fetchReports()
                }
            } catch (error) {
                toast.push(
                    <Notification type="danger" title="Error">
                        Failed to delete report
                    </Notification>,
                    { placement: 'top-center' }
                )
            }
        }
    }

    const handleDownloadReport = (reportUrl: string) => {
        window.open(reportUrl, '_blank')
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Medical Reports</h1>
                    <p className="text-gray-600 mt-1">Upload and manage your medical reports</p>
                </div>
                <Button
                    variant="solid"
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2"
                >
                    <HiOutlinePlus />
                    Upload Report
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <Spinner size={40} />
                </div>
            ) : reports.length === 0 ? (
                <Card className="p-8 text-center">
                    <HiOutlineDocument className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                    <p className="text-gray-600 mb-4">Upload your first medical report to get started</p>
                    {/* <Button
                        variant="solid"
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2"
                    >
                        <HiOutlinePlus />
                        Upload Report
                    </Button> */}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {report.doctor_name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(report.report_date), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        onClick={() => handleViewReport(report)}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <HiOutlineEye className="text-lg" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        onClick={() => handleDeleteReport(report.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <HiOutlineTrash className="text-lg" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Patient Name</p>
                                    <p className="text-sm text-gray-600">{report.patient_name}</p>
                                </div>
                                
                                {report.report_reason && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Reason</p>
                                        <p className="text-sm text-gray-600">{report.report_reason}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button
                                    size="sm"
                                    variant="solid"
                                    block
                                    onClick={() => handleDownloadReport(report.report_pdf)}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <HiOutlineDocument />
                                    View Report
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Drawer */}
            <Drawer
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                width={600}
                title="Upload Medical Report"
            >
                <div className="p-4">
                    <Form onSubmit={handleSubmit(onSubmitUpload)}>
                        <FormContainer>
                            <FormItem
                                label="Report Date"
                                invalid={!!errors.report_date}
                                errorMessage={errors.report_date?.message}
                            >
                                <Controller
                                    name="report_date"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            placeholder="Select report date"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Doctor Name"
                                invalid={!!errors.doctor_name}
                                errorMessage={errors.doctor_name?.message}
                            >
                                <Controller
                                    name="doctor_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Enter doctor's name"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Report Files"
                                invalid={!!errors.files}
                                errorMessage={errors.files?.message}
                            >
                                <Upload
                                    accept="application/pdf"
                                    multiple
                                    draggable
                                    onChange={handleUploadFiles}
                                    fileList={uploadFiles}
                                    uploadLimit={5}
                                >
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                                        <HiOutlineCloudUpload className="text-4xl text-gray-400 mb-2" />
                                        <p className="text-gray-600 font-medium">
                                            Click or drag files to upload
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Support PDF files only (max 5 files)
                                        </p>
                                    </div>
                                </Upload>
                            </FormItem>
                        </FormContainer>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="plain"
                                onClick={() => setShowUploadModal(false)}
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="solid"
                                loading={uploading}
                            >
                                Upload Reports
                            </Button>
                        </div>
                    </Form>
                </div>
            </Drawer>

            {/* View Report Modal */}
            <Drawer
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                width={600}
                title="Report Details"
            >
                {selectedReport && (
                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Doctor Name</p>
                                    <p className="text-sm text-gray-900">{selectedReport.doctor_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Report Date</p>
                                    <p className="text-sm text-gray-900">
                                        {format(new Date(selectedReport.report_date), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Patient Name</p>
                                <p className="text-sm text-gray-900">{selectedReport.patient_name}</p>
                            </div>

                            {selectedReport.report_reason && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Reason</p>
                                    <p className="text-sm text-gray-900">{selectedReport.report_reason}</p>
                                </div>
                            )}

                            {selectedReport.report_analysis && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Analysis</p>
                                    <p className="text-sm text-gray-900">{selectedReport.report_analysis}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <Button
                                    variant="solid"
                                    block
                                    onClick={() => handleDownloadReport(selectedReport.report_pdf)}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <HiOutlineDocument />
                                    View Report PDF
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                variant="plain"
                                onClick={() => setShowViewModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    )
}

export default UserReports 