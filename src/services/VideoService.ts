import ApiService from './ApiService'

interface TokenResponse {
    success: boolean
    token: string
}

interface RoomResponse {
    success: boolean
    room: {
        sid: string
        uniqueName: string
        status: string
    }
}

interface RoomsResponse {
    success: boolean
    rooms: Array<{
        sid: string
        uniqueName: string
        status: string
        dateCreated: string
        dateUpdated: string
    }>
}

interface ParticipantsResponse {
    success: boolean
    participants: Array<{
        sid: string
        identity: string
        status: string
        dateCreated: string
        dateUpdated: string
    }>
}

interface GenerateTokenRequest {
    identity: string
    roomName: string
}

interface CreateRoomRequest {
    roomName: string
}

const VideoService = {
    /**
     * Generate a token for video calls
     */
    generateToken: (data: GenerateTokenRequest) => {
        return ApiService.fetchDataWithAxios<TokenResponse>({
            url: '/api/video/token',
            method: 'POST',
            data
        })
    },

    /**
     * Create a new video room
     */
    createRoom: (data: CreateRoomRequest) => {
        return ApiService.fetchDataWithAxios<RoomResponse>({
            url: '/api/video/room',
            method: 'POST',
            data
        })
    },

    /**
     * Get a list of all video rooms
     */
    listRooms: (status?: 'in-progress' | 'completed') => {
        return ApiService.fetchDataWithAxios<RoomsResponse>({
            url: '/api/video/rooms',
            method: 'GET',
            params: status ? { status } : undefined
        })
    },

    /**
     * Get details of a specific room
     */
    getRoom: (roomSid: string) => {
        return ApiService.fetchDataWithAxios<RoomResponse>({
            url: `/api/video/room/${roomSid}`,
            method: 'GET'
        })
    },

    /**
     * End a room manually
     */
    completeRoom: (roomSid: string) => {
        return ApiService.fetchDataWithAxios<RoomResponse>({
            url: `/api/video/room/${roomSid}/complete`,
            method: 'POST'
        })
    },

    /**
     * List all participants in a room
     */
    listParticipants: (roomSid: string) => {
        return ApiService.fetchDataWithAxios<ParticipantsResponse>({
            url: `/api/video/room/${roomSid}/participants`,
            method: 'GET'
        })
    },

    /**
     * Disconnect a participant from a room
     */
    disconnectParticipant: (roomSid: string, participantSid: string) => {
        return ApiService.fetchDataWithAxios<{ success: boolean, message: string }>({
            url: `/api/video/room/${roomSid}/participant/${participantSid}/disconnect`,
            method: 'POST'
        })
    }
}

export default VideoService 