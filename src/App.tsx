import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'
import { VideoCallProvider } from '@/contexts/VideoCallContext'
import VideoCallModal from '@/components/shared/VideoCallModal'
import { SocketContextProvider } from '@/contexts/SocketContext'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <SocketContextProvider>
                        <VideoCallProvider>
                            <Routes>
                                <Route
                                    path="/*"
                                    element={
                                        <Layout>
                                            <Views />
                                        </Layout>
                                    }
                                />
                            </Routes>
                            {/* Global video call modal */}
                            <VideoCallModal />
                        </VideoCallProvider>
                    </SocketContextProvider>
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App
