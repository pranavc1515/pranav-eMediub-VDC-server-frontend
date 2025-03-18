import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
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
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App
