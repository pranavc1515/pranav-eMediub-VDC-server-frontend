import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiDownload, HiEye } from 'react-icons/hi'
import { format } from 'date-fns'

interface Report {
    id: number
    doctorName: string
    date: string
    type: string
    summary: string
    findings: Array<{
        parameter: string
        value: string
        normalRange: string
    }>
    conclusion: string
    recommendations: string
}

const MedicalReportView = () => {
    const [reports] = useState<Report[]>([
        {
            id: 1,
            doctorName: 'Dr. Shubham patle',
            date: '2024-03-20',
            type: 'Blood Test Report',
            summary: 'Complete Blood Count (CBC)',
            findings: [
                {
                    parameter: 'Hemoglobin',
                    value: '13.5 g/dL',
                    normalRange: '12.0-15.5 g/dL',
                },
                {
                    parameter: 'White Blood Cells',
                    value: '7.5 x10^9/L',
                    normalRange: '4.0-11.0 x10^9/L',
                },
                {
                    parameter: 'Platelets',
                    value: '250 x10^9/L',
                    normalRange: '150-450 x10^9/L',
                },
            ],
            conclusion:
                'All parameters are within normal range. No significant abnormalities detected.',
            recommendations:
                'Continue with regular health check-ups. Maintain a balanced diet and exercise routine.',
        },
        // {
        //     id: 2,
        //     doctorName: 'Dr. Jane Smith',
        //     date: '2024-03-15',
        //     type: 'X-Ray Report',
        //     summary: 'Chest X-Ray Examination',
        //     findings: [
        //         { parameter: 'Lungs', value: 'Clear', normalRange: 'Normal' },
        //         {
        //             parameter: 'Heart Size',
        //             value: 'Normal',
        //             normalRange: 'Normal',
        //         },
        //         {
        //             parameter: 'Diaphragm',
        //             value: 'Normal',
        //             normalRange: 'Normal',
        //         },
        //     ],
        //     conclusion:
        //         'No significant abnormalities detected in the chest X-ray.',
        //     recommendations: 'Follow-up in 6 months if symptoms persist.',
        // },
    ])

    const [selectedReport, setSelectedReport] = useState<Report | null>(null)

    const handleViewReport = (report: Report) => {
        setSelectedReport(report)
    }

    const handleCloseReport = () => {
        setSelectedReport(null)
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {report.doctorName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {format(
                                        new Date(report.date),
                                        'MMM dd, yyyy',
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="solid"
                                    className="flex items-center gap-2"
                                    onClick={() => handleViewReport(report)}
                                >
                                    <HiEye />
                                    <span>View</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    className="flex items-center gap-2"
                                >
                                    <HiDownload />
                                    <span>Download</span>
                                </Button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Report Type</h4>
                            <p className="text-gray-600">{report.type}</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-gray-600">{report.summary}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {selectedReport.type}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedReport.doctorName} •{' '}
                                        {format(
                                            new Date(selectedReport.date),
                                            'MMM dd, yyyy',
                                        )}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    className="flex items-center gap-2"
                                    onClick={handleCloseReport}
                                >
                                    Close
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Summary
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedReport.summary}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Findings
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedReport.findings.map(
                                            (finding, index) => (
                                                <div
                                                    key={index}
                                                    className="text-gray-600"
                                                >
                                                    <span className="font-medium">
                                                        {finding.parameter}:
                                                    </span>{' '}
                                                    {finding.value}
                                                    <span className="text-sm text-gray-500">
                                                        {' '}
                                                        (Normal:{' '}
                                                        {finding.normalRange})
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Conclusion
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedReport.conclusion}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Recommendations
                                    </h3>
                                    <p className="text-gray-600">
                                        {selectedReport.recommendations}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default MedicalReportView
