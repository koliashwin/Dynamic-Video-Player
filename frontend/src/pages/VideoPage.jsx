import React, { useEffect, useRef, useState } from 'react'
import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import NavigationPanel from '../components/NavigationPanel';
import Timeline from '../components/Timeline';
import GlobalProgress from '../components/GlobalProgress';
import { Alert, Box, CircularProgress, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { palette } from '../theme';
import { DynamicFeedRounded, TuneRounded } from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { usePlayableFlow } from '../hooks/UsePlayableFlow';

const VideoPage = () => {

    const { flowId } = useParams();
    const leftColumnRef = useRef(null);
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

    if (player.loadError) {
        return (
            <Container maxWidth='sm' sx={{ pt: 10 }}>
                <Alert severity='error' variant='outlined'>
                    {player.loadError}
                </Alert>
            </Container> 
        )
    }

    if (player.sections.length === 0) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                }}
            >
                <CircularProgress size={28} sx={{ color: palette.filmAmber }} />
                <Typography sx={{ color: 'text.secondary', fontSize: 13, letterSpacing: '0.05em' }}>
                    LOADING CLIP...
                </Typography>
            </Box>
        )
    }

    return (
        <Container maxWidth='lg' sx={{ py: { xs: 4, sm: 6 } }}>
            <Stack spacing={1} sx={{ alignItems: 'center' }}>

                <Box sx={{ position: 'relative', width: '100%' }}>
                    <Stack spacing={0.5} sx={{ textAlign: 'center', alignItems: "center" }}>
                        <Typography variant='h1' sx={{ fontSize: { xs: 24, sm: 30 } }}>
                            Dynamic Video Player
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {player.flowName
                                ? `Playing: ${player.flowName}`
                                : 'A branching video with dynamic navigation system'}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 0, top: 0 }}>
                        <Tooltip title='Browse flows'>
                            <IconButton
                                component={RouterLink}
                                to='/feed'
                                size='small'
                            >
                                <DynamicFeedRounded fontSize='small' />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Configuration panel'>
                            <IconButton
                                component={RouterLink}
                                to='/config/clips'
                                size='small'
                            >
                                <TuneRounded fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ width: '100%', alignItems: { xs: 'center', md: 'flex-start' } }}
                >
                    <Stack ref={leftColumnRef} spacing={3} sx={{ flex: 1, minWidth: 0, width: '100%' }}>

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
        </Container>
    )
}

export default VideoPage
