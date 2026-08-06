import React, { useEffect, useRef, useState } from 'react'
import { usePlayableFlow } from '../hooks/UsePlayableFlow'
import { Alert, Box, Chip, CircularProgress, Stack } from '@mui/material'
import { palette } from '../theme'
import { VisibilityRounded } from '@mui/icons-material'
import VideoPlayer from './VideoPlayer'
import VideoControls from './VideoControls'
import Timeline from './Timeline'
import GlobalProgress from './GlobalProgress'
import NavigationPanel from './NavigationPanel'

const InlineFlowPreview = ({ flowId }) => {
    const leftColumnRef = useRef(null)
    const [leftColumnHeight, setLeftColumnHeight] = useState(null)

    const player = usePlayableFlow(flowId)

    useEffect(() => {
        if (!leftColumnRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setLeftColumnHeight(entry.contentRect.height)
            }
        })

        observer.observe(leftColumnRef.current);
        return () => observer.disconnect();
    }, [])

    return (
        <Box
            sx={{
                mt: 1.5,
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: palette.filmAmber,
                backgroundColor: 'rgba(227, 166, 74, 0.04)'
            }}
        >
            <Chip
                icon={<VisibilityRounded sx={{ fontSize: 14 }} />}
                label="PREVIEW MODE"
                size='small'
                sx={{
                    mb: 1.5,
                    height: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: palette.filmAmber,
                    backgroundColor: 'rgba(227, 166, 74, 0.14)',
                    border: '1px solid',
                    borderColor: palette.filmAmber
                }}
            />

            {player.loadError ? (
                <Alert security='error' variant='outlined'>{player.loadError}</Alert>
            ) : player.sections.length === 0 ? (
                <Stack sx={{ py: 4, alignItems: 'center' }}>
                    <CircularProgress size={22} sx={{ color: palette.filmAmber }} />
                </Stack>
            ) : (
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
                    >
                        <Stack ref={leftColumnRef} spacing={1.5} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                            <VideoPlayer
                                clipKey={player.videoKey}
                                videoRef={player.videoRef}
                                src={player.currentVideo}
                                isTransitioning={player.isTransitioning}
                                onEnded={player.handleVideoEnded}
                                onTimeUpdate={player.handleTimeUpdate}
                                onLoadedMetadata={player.handleLoadedMetadata}
                                onLoadedData={player.handleVideoLoaded}
                                onPlay={player.handlePlay}
                                onPause={player.handlePause}
                                onError={player.handleVideoError}
                            />
                            <VideoControls
                                isPlaying={player.isPlaying}
                                currentTime={player.currentTime}
                                duration={player.duration}
                                onTogglePlay={player.togglePlayPause}
                                onSeek={player.handleSeek}
                            />
                        </Stack>

                        <Timeline
                            sections={player.sections}
                            currentSectionIndex={player.position.section}
                            onSectionSelect={player.goToSectionWithTransition}
                            selectedClip={player.position.clip}
                            onSelectClip={player.selectClipWithTransition}
                            maxHeight={leftColumnHeight}
                        />
                    </Stack>

                    <GlobalProgress
                        currentTime={player.globalCurrentTime}
                        estimatedTotal={player.estimatedTotal}
                        paceDelta={player.paceDelta}
                    />

                    <NavigationPanel
                        onPrevSection={player.previousSectionWithTransition}
                        onPrevClip={player.previousClipWithTransition}
                        onNextClip={player.nextClipWithTransition}
                        onNextSection={player.nextSectionWithTransition}
                        onReload={player.loadVideoStructure}
                        canGoPreviousSection={player.canGoPreviousSection}
                        canGoNextClip={player.canGoNextClip}
                        canGoPreviousClip={player.canGoPreviousClip}
                        canGoNextSection={player.canGoNextSection}
                    />
                </Stack>
            )}
        </Box>
    )
}

export default InlineFlowPreview
