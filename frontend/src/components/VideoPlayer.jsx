import React from 'react'
import { Box } from '@mui/material'
import TransitionOverlay from './TransitionOverlay'

const VideoPlayer = ({
    videoRef,
    src,
    isTransitioning,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onLoadedData,
    onPlay,
    onPause,
    onError,
    clipKey
}) => {
    return (
        <Box
            sx={{
                position: "relative",
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#000',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 20px 60px -20px rgba(0,0,0,0.6)'
            }}
        >
            {/* 
                    single reusable video element
                    clips are swapped by changing src
                    current prototype intentionally uses one video element rather than Media Source Extensions (MSE)
                */}
            <Box
                component="video"
                key={clipKey}
                ref={videoRef}
                src={src}
                // width={800}
                controls={false}
                onEnded={onEnded}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onLoadedData={onLoadedData}
                onPlay={onPlay}
                onPause={onPause}
                onError={onError}
                sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: 'block'
                }}
            />

            <TransitionOverlay isTransitioning={isTransitioning} />
        </Box>
    )
}

export default VideoPlayer
