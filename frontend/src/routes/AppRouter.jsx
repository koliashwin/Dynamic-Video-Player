import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ConfigLayout from '../layouts/ConfigLayout'
import ClipPage from '../pages/ClipPage'
import VideoPage from '../pages/VideoPage'
import SectionPage from '../pages/SectionPage'
import FlowPage from '../pages/FlowPage'
import FeedPage from '../pages/FeedPage'
import LandingPage from '../pages/LandingPage'
import VaultBrowsePage from '../pages/VaultBrowsePage'

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/feed' element={<FeedPage />} />
                <Route path='/vault' element={<VaultBrowsePage/>} />
                <Route path='/flow/:flowId' element={<VideoPage />} />
                <Route path='/flow' element={<VideoPage />} />
                <Route path='/config' element={<ConfigLayout />}>
                    <Route path='clips' element={<ClipPage />} />
                    <Route path='sections' element={<SectionPage />} />
                    <Route path='flows' element={<FlowPage />} />
                    <Route path='vault' element={<VaultBrowsePage/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter
