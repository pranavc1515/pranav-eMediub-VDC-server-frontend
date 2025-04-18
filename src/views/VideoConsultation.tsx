import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoCallInterface from '@/components/shared/VideoCallInterface';
import PatientLobby from '@/components/shared/PatientLobby';
import { useSessionUser } from '@/store/authStore';

const VideoConsultation = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [isInConsultation, setIsInConsultation] = useState(false);
  const [roomName, setRoomName] = useState<string | undefined>(undefined);
  const [consultationId, setConsultationId] = useState<string | undefined>(undefined);
  
  const user = useSessionUser((state) => state.user);
  const isDoctor = user.authority?.includes('doctor') || false;
  
  // If user is a doctor and somehow navigated to this route with doctorId
  if (isDoctor) {
    navigate('/');
    return null;
  }
  
  const handleJoinConsultation = (roomName: string, consultationId: string) => {
    setRoomName(roomName);
    setConsultationId(consultationId);
    setIsInConsultation(true);
  };
  
  const handleLeaveQueue = () => {
    navigate('/');
  };
  
  const handleCallEnd = () => {
    navigate('/');
  };
  
  // If doctorId is not provided, redirect to home
  if (!doctorId) {
    navigate('/');
    return null;
  }

  return (
    <>
      {isInConsultation ? (
        <VideoCallInterface
          roomName={roomName}
          doctorId={doctorId}
          onCallEnd={handleCallEnd}
        />
      ) : (
        <PatientLobby
          doctorId={doctorId}
          onJoinConsultation={handleJoinConsultation}
          onLeaveQueue={handleLeaveQueue}
        />
      )}
    </>
  );
};

export default VideoConsultation; 