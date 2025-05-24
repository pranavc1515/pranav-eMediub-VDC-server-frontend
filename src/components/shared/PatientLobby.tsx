// import React, { useEffect, useState } from 'react'
// import { Card, Button, Badge } from '@/components/ui'
// import { useSessionUser } from '@/store/authStore'
// import { io, Socket } from 'socket.io-client'

// // Define the API URL using Vite's import.meta.env
// // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// const API_URL = 'http://localhost:3000'

// interface PatientLobbyProps {
//     doctorId: string
//     onJoinConsultation: (roomName: string, consultationId: string) => void
//     onLeaveQueue: () => void
// }

// interface QueueStatus {
//     position: number
//     estimatedWait: string
// }

// const PatientLobby: React.FC<PatientLobbyProps> = ({
//     doctorId,
//     onJoinConsultation,
//     onLeaveQueue,
// }) => {
//     const [socket, setSocket] = useState<Socket | null>(null)
//     const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
//     const [isConnecting, setIsConnecting] = useState(true)
//     const [error, setError] = useState<string | null>(null)
//     const [roomName] = useState(
//         `room-${Math.random().toString(36).substring(2, 11)}`,
//     )

//     const user = useSessionUser((state) => state.user)

//     useEffect(() => {
//         console.log('patient lobby')
//         // Initialize socket connection
//         const socket = io(API_URL, {
//             query: {
//                 userType: 'patient',
//                 userId: user.userId,
//             },
//         })
//         setSocket(socket)

//         // Join queue
//         socket.emit('PATIENT_JOIN_QUEUE', {
//             doctorId,
//             patientId: user.userId,
//             roomName,
//         })

//         // Listen for queue updates
//         socket.on('QUEUE_POSITION_UPDATE', (status: QueueStatus) => {
//             setQueueStatus(status)
//             setIsConnecting(false)
//         })

//         // Listen for invitation to join consultation
//         socket.on(
//             'INVITE_PATIENT',
//             (data: { roomName: string; consultationId: string }) => {
//                 onJoinConsultation(data.roomName, data.consultationId)
//             },
//         )

//         // Error handling
//         socket.on('ERROR', (data: { message: string }) => {
//             setError(data.message)
//             setIsConnecting(false)
//         })

//         return () => {
//             socket.disconnect()
//         }
//     }, [doctorId, user.userId, roomName, onJoinConsultation])

//     const handleLeaveQueue = () => {
//         if (socket) {
//             socket.emit('LEAVE_QUEUE', {
//                 doctorId,
//                 patientId: user.userId,
//             })
//             onLeaveQueue()
//         }
//     }

//     return (
//         <div className="flex items-center justify-center min-h-full">
//             <Card className="w-full max-w-md p-6">
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-white mb-4">
//                         Waiting for your consultation
//                     </h2>

//                     {isConnecting && (
//                         <div className="flex justify-center mb-4">
//                             <div className="animate-pulse text-primary-500">
//                                 Joining queue...
//                             </div>
//                         </div>
//                     )}

//                     {error && (
//                         <div className="bg-red-100 text-red-600 p-4 rounded mb-4">
//                             {error}
//                         </div>
//                     )}

//                     {queueStatus && (
//                         <div className="mb-6">
//                             <div className="flex justify-center mb-4">
//                                 <Badge className="bg-primary-500 text-white px-4 py-2 rounded-full text-lg">
//                                     Queue position: {queueStatus.position}
//                                 </Badge>
//                             </div>
//                             <p className="text-lg mb-2">
//                                 Estimated wait time:{' '}
//                                 <span className="font-bold">
//                                     {queueStatus.estimatedWait}
//                                 </span>
//                             </p>
//                             <p className="text-gray-500">
//                                 Please don&apos;t close this window. You&apos;ll
//                                 be connected with the doctor shortly.
//                             </p>
//                         </div>
//                     )}

//                     <div className="flex justify-center">
//                         <Button
//                             variant="solid"
//                             className="bg-red-500"
//                             onClick={handleLeaveQueue}
//                         >
//                             Leave Queue
//                         </Button>
//                     </div>
//                 </div>
//             </Card>
//         </div>
//     )
// }

// export default PatientLobby
