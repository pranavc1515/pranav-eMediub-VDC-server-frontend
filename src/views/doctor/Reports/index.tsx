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
    Select,
    Badge,
} from '@/components/ui'
import toast from '@/components/ui/toast'
import ReportsService, { ReportData, UploadReportRequest } from '@/services/ReportsService'
import { HiOutlineCloudUpload, HiOutlineEye, HiOutlineTrash, HiOutlineDocument, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi'
import { format } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSessionUser } from '@/store/authStore'
import { useSearchParams } from 'react-router-dom'

// Select option interface
interface SelectOption {
    value: string
    label: string
}

// Validation schema
const uploadReportSchema = z.object({
    target_user_id: z.number().min(1, 'Patient ID is required'),
    report_date: z.date({
        required_error: 'Report date is required',
    }),
    doctor_name: z.string().min(1, 'Doctor name is required'),
    files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
})

type UploadReportFormData = z.infer<typeof uploadReportSchema>

const DoctorReports = () => {
    const user = useSessionUser((state) => state.user)
    const [searchParams, setSearchParams] = useSearchParams()
    const [reports, setReports] = useState<ReportData[]>([])
    const [filteredReports, setFilteredReports] = useState<ReportData[]>([])
    const [loading, setLoading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
    const [uploadFiles, setUploadFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Select options with counts
    const getFilterOptions = (): SelectOption[] => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const allCount = reports.length
        const recentCount = reports.filter(report => {
            const reportDate = new Date(report.created_at)
            return reportDate >= thirtyDaysAgo
        }).length
        const olderCount = reports.filter(report => {
            const reportDate = new Date(report.created_at)
            return reportDate < thirtyDaysAgo
        }).length

        return [
            { value: 'all', label: `All Reports (${allCount})` },
            { value: 'recent', label: `Recent (${recentCount})` },
            { value: 'older', label: `Older (${olderCount})` },
        ]
    }

    const filterOptions = getFilterOptions()

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<UploadReportFormData>({
        resolver: zodResolver(uploadReportSchema),
        defaultValues: {
            target_user_id: 0,
            report_date: new Date(),
            doctor_name: '',
            files: [],
        },
    })

    // Auto-populate doctor information when component mounts or user changes
    useEffect(() => {
        if (user.userName) {
            setValue('doctor_name', user.userName)
        }
    }, [user.userName, setValue])

    // Fetch reports on component mount
    useEffect(() => {
        fetchReports()
    }, [])

    // Check for patientId URL parameter and auto-open upload modal
    useEffect(() => {
        const patientId = searchParams.get('patientId')
        if (patientId) {
            const patientIdNumber = parseInt(patientId)
            if (!isNaN(patientIdNumber) && patientIdNumber > 0) {
                // Set the patient ID in the form
                setValue('target_user_id', patientIdNumber)
                // Set doctor name if available
                if (user.userName) {
                    setValue('doctor_name', user.userName)
                }
                // Open the upload modal
                setShowUploadModal(true)
                // Remove the patientId parameter from URL to clean it up
                const newSearchParams = new URLSearchParams(searchParams)
                newSearchParams.delete('patientId')
                setSearchParams(newSearchParams, { replace: true })
            }
        }
    }, [searchParams, setValue, user.userName, setSearchParams])

    // Filter reports based on search and status
    useEffect(() => {
        let filtered = reports

        // Apply date-based filtering
        if (filterStatus === 'recent') {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            
            filtered = filtered.filter(report => {
                const reportDate = new Date(report.created_at)
                return reportDate >= thirtyDaysAgo
            })
        } else if (filterStatus === 'older') {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            
            filtered = filtered.filter(report => {
                const reportDate = new Date(report.created_at)
                return reportDate < thirtyDaysAgo
            })
        }
        // 'all' shows all reports, so no additional filtering needed

        // Apply search filtering
        if (searchTerm) {
            filtered = filtered.filter(
                report =>
                    report.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.user_id.toString().includes(searchTerm)
            )
        }

        setFilteredReports(filtered)
    }, [reports, searchTerm, filterStatus])

    const fetchReports = async () => {
        setLoading(true)
        try {
            const response = await ReportsService.getReports()
            if (response.status && response.data) {
                // Combine self and family reports
                const allReports = [
                    ...(response.data.selfReports || []),
                    ...(response.data.familyReports || [])
                ]
                setReports(allReports)
                setFilteredReports(allReports)
            }
        } catch {
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
            const uploadData: UploadReportRequest = {
                report_pdf: data.files,
                report_date: format(data.report_date, 'yyyy-MM-dd'),
                doctor_name: data.doctor_name,
                target_user_id: data.target_user_id,
                doctor_id: user.userId ? parseInt(user.userId.toString()) : undefined, // Auto-populate doctor_id from localStorage
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
                
                // Refresh the default doctor name after reset
                setValue('doctor_name', user.userName)
                
                // Refresh reports list
                fetchReports()
            } else {
                throw new Error(response.message)
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload report'
            toast.push(
                <Notification type="danger" title="Error">
                    {errorMessage}
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
            } catch {
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
                    <h1 className="text-2xl font-bold text-gray-900">Patient Reports</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-600">Upload and manage medical reports for your patients</p>
                        {filteredReports.length > 0 && (
                            <Badge className="bg-blue-100 text-blue-800">
                                {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
                                {filterStatus !== 'all' && ` (${filterStatus})`}
                            </Badge>
                        )}
                    </div>
                </div>
                <Button
                    variant="solid"
                    onClick={() => {
                        setShowUploadModal(true)
                        // Ensure doctor name is populated when opening modal
                        setValue('doctor_name', user.userName)
                    }}
                    className="flex items-center gap-2"
                >
                    <HiOutlinePlus />
                    Upload Report
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by patient name, user ID, or doctor name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<HiOutlineSearch className="text-gray-400" />}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <Select<SelectOption>
                            placeholder="Filter by date"
                            value={filterOptions.find(option => option.value === filterStatus)}
                            onChange={(option: SelectOption | null) => setFilterStatus(option?.value || 'all')}
                            options={filterOptions}
                        />
                        {filterStatus !== 'all' && (
                            <p className="text-xs text-gray-500 mt-1">
                                {filterStatus === 'recent' ? 'Last 30 days' : 'Older than 30 days'}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <Spinner size={40} />
                </div>
            ) : filteredReports.length === 0 ? (
                <Card className="p-8 text-center">
                    <HiOutlineDocument className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm || filterStatus !== 'all' 
                            ? 'No matching reports found' 
                            : 'No reports yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? (
                            'Try adjusting your search terms or filter options'
                        ) : filterStatus === 'recent' ? (
                            'No reports found in the last 30 days'
                        ) : filterStatus === 'older' ? (
                            'No reports older than 30 days found'
                        ) : (
                            'Upload your first patient report to get started'
                        )}
                    </p>
                    {(!searchTerm && filterStatus === 'all') && (
                        <Button
                            variant="solid"
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2"
                        >
                            <HiOutlinePlus />
                            Upload Report
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {report.patient_name}
                                        </h3>
                                        <Badge className="bg-blue-100 text-blue-800">
                                            ID: {report.user_id}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Dr. {report.doctor_name}
                                    </p>
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
                                {report.type && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Report Type</p>
                                        <p className="text-sm text-gray-600 capitalize">{report.type}</p>
                                    </div>
                                )}
                                
                                {report.report_reason && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Reason</p>
                                        <p className="text-sm text-gray-600">{report.report_reason}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Uploaded</p>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
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

            {/* Upload Modal */}
            <Dialog
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                className="max-w-2xl"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Upload Patient Report</h3>
                    
                    <Form onSubmit={handleSubmit(onSubmitUpload)}>
                        <FormContainer>
                            <FormItem
                                label="Patient ID"
                                invalid={!!errors.target_user_id}
                                errorMessage={errors.target_user_id?.message}
                            >
                                <Controller
                                    name="target_user_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="Enter patient's user ID"
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    )}
                                />
                            </FormItem>

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
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                placeholder="Doctor name (auto-filled)"
                                                readOnly
                                                className="bg-gray-50 dark:bg-gray-800"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                                                    Auto-filled
                                                </Badge>
                                            </div>
                                        </div>
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
            </Dialog>

            {/* View Report Modal */}
            <Dialog
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                className="max-w-2xl"
            >
                {selectedReport && (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Report Details</h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Patient Name</p>
                                    <p className="text-sm text-gray-900">{selectedReport.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Patient ID</p>
                                    <p className="text-sm text-gray-900">{selectedReport.user_id}</p>
                                </div>
                            </div>

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

                            {selectedReport.type && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Report Type</p>
                                    <p className="text-sm text-gray-900 capitalize">{selectedReport.type}</p>
                                </div>
                            )}

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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Created</p>
                                    <p className="text-sm text-gray-900">
                                        {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Updated</p>
                                    <p className="text-sm text-gray-900">
                                        {format(new Date(selectedReport.updated_at), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                            </div>

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
            </Dialog>
        </div>
    )
}

export default DoctorReports 