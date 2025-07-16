import { useState, useEffect } from 'react'
import { Drawer, Form, FormItem, Input, Button, Card, Checkbox, Switcher } from '@/components/ui'
import { HiOutlineInformationCircle, HiOutlineCurrencyRupee } from 'react-icons/hi'
import DoctorService, { UpdateVDCSettingsRequest } from '@/services/DoctorService'

interface VDCConfigurationDrawerProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (enabled: boolean) => void
    initialData?: {
        vdcEnabled?: boolean
        consultationFees?: string
        availableDays?: string[]
        availableTimeSlots?: Record<string, { start: string; end: string }>
    }
}

const VDCConfigurationDrawer = ({ 
    isOpen, 
    onClose, 
    onSuccess, 
    initialData 
}: VDCConfigurationDrawerProps) => {
    const [consultationFee, setConsultationFee] = useState<number>(0)
    const [platformFee, setPlatformFee] = useState<number>(0)
    const [netAmount, setNetAmount] = useState<number>(0)
    const [acceptTerms, setAcceptTerms] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isEditMode, setIsEditMode] = useState<boolean>(false)

    // Available days options
    const daysOfWeek = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
    ]

    const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
    const [timeSlots, setTimeSlots] = useState<Record<string, { start: string; end: string }>>({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
    })

    useEffect(() => {
        if (initialData) {
            setConsultationFee(parseFloat(initialData.consultationFees || '0'))
            setIsEditMode(!!initialData.vdcEnabled)
            setAcceptTerms(!!initialData.vdcEnabled)
            
            if (initialData.availableDays) {
                setSelectedDays(initialData.availableDays)
            }
            
            if (initialData.availableTimeSlots) {
                setTimeSlots(initialData.availableTimeSlots)
            }
        }
    }, [initialData])

    useEffect(() => {
        const platformFeeAmount = consultationFee * 0.1
        const netAmountAfterDeduction = consultationFee - platformFeeAmount
        
        setPlatformFee(platformFeeAmount)
        setNetAmount(netAmountAfterDeduction)
    }, [consultationFee])

    const handleDayToggle = (day: string, checked: boolean) => {
        if (checked) {
            setSelectedDays(prev => [...prev, day])
            if (!timeSlots[day]) {
                setTimeSlots(prev => ({
                    ...prev,
                    [day]: { start: '09:00', end: '17:00' }
                }))
            }
        } else {
            setSelectedDays(prev => prev.filter(d => d !== day))
            setTimeSlots(prev => {
                const { [day]: removed, ...rest } = prev
                return rest
            })
        }
    }

    const handleTimeSlotChange = (day: string, type: 'start' | 'end', value: string) => {
        setTimeSlots(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value
            }
        }))
    }

    const validateForm = () => {
        if (consultationFee <= 0) {
            return 'Please enter a valid consultation fee'
        }
        if (selectedDays.length === 0) {
            return 'Please select at least one available day'
        }
        if (!acceptTerms) {
            return 'Please accept the terms and conditions'
        }
        return null
    }

    const handleSubmit = async () => {
        const validation = validateForm()
        if (validation) {
            alert(validation)
            return
        }

        setIsSubmitting(true)
        try {
            const requestData: UpdateVDCSettingsRequest = {
                vdcEnabled: true,
                consultationFees: consultationFee,
                availableDays: selectedDays,
                availableTimeSlots: timeSlots
            }

            await DoctorService.updateVDCSettings(requestData)
            onSuccess(true)
            onClose()
        } catch (error) {
            console.error('Error updating VDC settings:', error)
            alert('Failed to update VDC settings. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            onClose()
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onRequestClose={handleClose}
            title={isEditMode ? "Update VDC Settings" : "Setup Virtual Doctor Consultation (VDC)"}
            width={600}
            bodyClass="p-0"
        >
            <div className="p-6 space-y-6">
                {/* Introduction */}
                {!isEditMode && (
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <HiOutlineInformationCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1">
                                    Welcome to Virtual Doctor Consultation
                                </h4>
                                <p className="text-blue-700 text-sm">
                                    Set up your VDC service to provide remote consultations to patients. 
                                    Configure your fees, availability, and start connecting with patients virtually.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                <Form>
                    {/* Consultation Fee Section */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <HiOutlineCurrencyRupee className="h-5 w-5 text-green-600" />
                            Consultation Fee
                        </h3>
                        
                        <FormItem label="Set your consultation fee (₹)" asterisk>
                            <Input
                                type="number"
                                min="1"
                                value={consultationFee || ''}
                                onChange={(e) => setConsultationFee(parseInt(e.target.value) || 0)}
                                placeholder="Enter consultation fee"
                                className="w-full"
                            />
                        </FormItem>

                        {/* Fee Breakdown */}
                        {consultationFee > 0 && (
                            <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Consultation Fee:</span>
                                    <span className="font-medium">₹{consultationFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Platform Fee (10%):</span>
                                    <span className="font-medium text-red-600">-₹{platformFee.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span className="text-gray-900">You will receive:</span>
                                        <span className="text-green-600">₹{netAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Availability Section */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Availability Schedule
                        </h3>
                        
                        <FormItem label="Available Days" asterisk>
                            <div className="grid grid-cols-2 gap-3">
                                {daysOfWeek.map((day) => (
                                    <div key={day.value} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedDays.includes(day.value)}
                                            onChange={(checked) => handleDayToggle(day.value, checked)}
                                        />
                                        <span className="text-sm">{day.label}</span>
                                    </div>
                                ))}
                            </div>
                        </FormItem>

                        {/* Time Slots */}
                        {selectedDays.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <h4 className="font-medium text-gray-900">Time Slots</h4>
                                {selectedDays.map((day) => (
                                    <div key={day} className="flex items-center gap-3">
                                        <div className="w-20 text-sm font-medium capitalize">
                                            {day.substring(0, 3)}
                                        </div>
                                        <Input
                                            type="time"
                                            value={timeSlots[day]?.start || '09:00'}
                                            onChange={(e) => handleTimeSlotChange(day, 'start', e.target.value)}
                                            className="w-32"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <Input
                                            type="time"
                                            value={timeSlots[day]?.end || '17:00'}
                                            onChange={(e) => handleTimeSlotChange(day, 'end', e.target.value)}
                                            className="w-32"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Terms and Conditions */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Terms & Conditions
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                            <p className="mb-2">
                                <strong>VDC Service Terms:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Platform charges 10% commission on each successful consultation</li>
                                <li>Payments will be processed within 24-48 hours after consultation completion</li>
                                <li>You must maintain professional standards during video consultations</li>
                                <li>All consultations are recorded for quality and legal purposes</li>
                                <li>You can modify your availability and fees anytime from settings</li>
                                <li>Minimum consultation fee is ₹50</li>
                                <li>Refund policies apply as per platform guidelines</li>
                            </ul>
                        </div>
                        
                        <div className="mt-4 flex items-start gap-3">
                            <Checkbox
                                checked={acceptTerms}
                                onChange={(checked) => setAcceptTerms(checked)}
                            />
                            <label className="text-sm text-gray-700">
                                I accept the terms and conditions for VDC services and agree to 
                                the platform fee structure.
                            </label>
                        </div>
                    </Card>
                </Form>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        variant="default"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!acceptTerms || consultationFee <= 0 || selectedDays.length === 0}
                        className="flex-1"
                    >
                        {isEditMode ? 'Update Settings' : 'Enable VDC Service'}
                    </Button>
                </div>
            </div>
        </Drawer>
    )
}

export default VDCConfigurationDrawer 