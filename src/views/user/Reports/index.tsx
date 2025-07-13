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
    Select,
} from '@/components/ui'
import toast from '@/components/ui/toast'
import ReportsService, { ReportData, UploadReportRequest } from '@/services/ReportsService'
import FamilyService, { FamilyMember } from '@/services/FamilyService'
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
    target_user_id: z.number().optional(),
})

type UploadReportFormData = z.infer<typeof uploadReportSchema>

// Interface for family member select options
interface FamilyMemberOption {
    value: number
    label: string
}

const UserReports = () => {
    const [reports, setReports] = useState<ReportData[]>([])
    const [loading, setLoading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
    const [uploadFiles, setUploadFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [familyMembers, setFamilyMembers] = useState<FamilyMemberOption[]>([])
    const [loadingFamily, setLoadingFamily] = useState(false)

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
            target_user_id: undefined,
        },
    })

    // Fetch reports on component mount
    useEffect(() => {
        fetchReports()
        fetchFamilyMembers()
    }, [])

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

    const fetchFamilyMembers = async () => {
        setLoadingFamily(true)
        try {
            const response = await FamilyService.getFamilyTree()
            if (response.status && response.data) {
                // Create self option
                const selfOption = {
                    value: response.data.user.id,
                    label: 'Self',
                }
                
                // Create family member options
                const familyOptions = response.data.familyTree.map((member) => ({
                    value: member.id,
                    label: `${member.name} (${member.relation_type})`,
                }))
                
                // Combine self and family options
                setFamilyMembers([selfOption, ...familyOptions])
            }
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch family members
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoadingFamily(false)
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
        } catch (error) {
            let errorMessage = 'Failed to upload report'
            if (error instanceof Error) {
                errorMessage = error.message
            }
            
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
                onClose={() => {
                    if (!uploading) {
                        setShowUploadModal(false)
                        reset()
                        setUploadFiles([])
                    }
                }}
                width={520}
                title="Upload Medical Report"
            >
                <div className="p-4">
                    <Form onSubmit={handleSubmit(onSubmitUpload)}>
                        <FormContainer>
                            <FormItem
                                label="For whom is this report?"
                                invalid={Boolean(errors.target_user_id)}
                                errorMessage={errors.target_user_id?.message}
                            >
                                <Controller
                                    name="target_user_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isLoading={loadingFamily}
                                            placeholder="Select family member"
                                            options={familyMembers}
                                            value={familyMembers.find(
                                                (option) => option.value === field.value
                                            )}
                                            onChange={(option) => {
                                                field.onChange(option?.value)
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="Report Date"
                                invalid={Boolean(errors.report_date)}
                                errorMessage={errors.report_date?.message}
                            >
                                <Controller
                                    name="report_date"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            placeholder="Select date"
                                            value={field.value}
                                            onChange={(date) => {
                                                field.onChange(date)
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="Doctor Name"
                                invalid={Boolean(errors.doctor_name)}
                                errorMessage={errors.doctor_name?.message}
                            >
                                <Controller
                                    name="doctor_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Enter doctor name" />
                                    )}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="Upload Report Files"
                                invalid={Boolean(errors.files)}
                                errorMessage={errors.files?.message}
                            >
                                <Upload
                                    draggable
                                    uploadLimit={5}
                                    onChange={(files) => handleUploadFiles(Array.from(files))}
                                    fileList={uploadFiles}
                                    multiple={true}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                >
                                    <div className="my-10 text-center">
                                        <div className="text-6xl mb-4 flex justify-center">
                                            <HiOutlineCloudUpload className="text-gray-400" />
                                        </div>
                                        <p className="font-semibold">
                                            <span className="text-gray-800 dark:text-white">
                                                Drop your files here, or{' '}
                                            </span>
                                            <span className="text-blue-500">browse</span>
                                        </p>
                                        <p className="mt-1 opacity-60 dark:text-white">
                                            Support: PDF, JPG, JPEG, PNG (Max 5 files)
                                        </p>
                                    </div>
                                </Upload>
                            </FormItem>
                            
                            <FormItem className="mt-6">
                                <Button
                                    block
                                    variant="solid"
                                    type="submit"
                                    loading={uploading}
                                    disabled={uploading}
                                >
                                    Upload Report
                                </Button>
                            </FormItem>
                        </FormContainer>
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