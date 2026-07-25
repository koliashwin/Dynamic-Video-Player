import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ConfigLayout from '../layouts/ConfigLayout'
import ClipPage from '../pages/ClipPage'
import VideoPage from '../pages/VideoPage'
import SectionPage from '../pages/SectionPage'
import FlowPage from '../pages/FlowPage'
import FeedPage from '../pages/FeedPage'

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<FeedPage />} />
                <Route path='/feed' element={<FeedPage />} />
                <Route path='/flow/:flowId' element={<VideoPage />} />
                <Route path='/flow' element={<VideoPage />} />
                <Route path='/config' element={<ConfigLayout />}>
                    <Route path='clips' element={<ClipPage />} />
                    <Route path='sections' element={<SectionPage />} />
                    <Route path='flows' element={<FlowPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter
