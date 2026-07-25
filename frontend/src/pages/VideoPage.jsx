import React, { useEffect, useRef, useState } from 'react'
import { getVideoStructure } from '../services/videoService';
import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import NavigationPanel from '../components/NavigationPanel';
import ChoiceSection from '../components/ChoiceSection';
import Timeline from '../components/Timeline';
import { getEstimatedElapsedDuration, getEstimatedTotalDuration } from '../utils/timelineUtils';
import GlobalProgress from '../components/GlobalProgress';
import { Alert, Box, CircularProgress, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { palette } from '../theme';
import { DynamicFeedRounded, TuneRounded } from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';

const VideoPage = () => {

    const { flowId } = useParams();
    const videoRef = useRef(null);
    const leftColumnRef = useRef(null);

    const [sections, setSections] = useState([])
    const [flowName, setFlowName] = useState(null)
    const [position, setPosition] = useState({
        section: 0,
        clip: 0
    })

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [pendingTransition, setPendingTransition] = useState(false)
    const [loadError, setLoadError] = useState(null)
    const [leftColumnHeight, setLeftColumnHeight] = useState(null)

    useEffect(() => {
        loadVideoStructure();
    }, [flowId]);

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

    const loadVideoStructure = async () => {
        try {
            setLoadError(null)
            setSections([])
            const data = await getVideoStructure(flowId);

            if (!data) {
                setLoadError('That flow could not be found')
                return
            }

            setSections(data.sections);
            setFlowName(data.flow?.name || null)

            setPosition({
                section: 0,
                clip: 0
            })

            setIsTransitioning(false)
            setPendingTransition(false)

        } catch (error) {
            console.error(error)
            setLoadError('could not reach the video service - either backend is down or flow is not created')
        }
    };

    const videoKey = `${position.section}-${position.clip}`

    const currentSection = sections[position.section];
    const currentVideo = currentSection?.clips[position.clip]?.url

    const totalDuration = getEstimatedTotalDuration(sections, position)
    const globalCurrentTime = getEstimatedElapsedDuration(sections, position, currentTime)

    const canGoPreviousSection = position.section > 0
    const canGoNextSection = position.section < sections.length - 1

    // random sections pick their clip automatically. no manual stepping,
    const canGoPreviousClip = currentSection?.type !== 'random' && position.clip > 0
    const canGoNextClip = currentSection?.type !== 'random' && position.clip < currentSection?.clips.length - 1

    const nextClip = () => {
        if (!currentSection) return false;

        if (position.clip < currentSection.clips.length - 1) {
            setPosition(prev => ({
                ...prev,
                clip: prev.clip + 1
            }));
            return true;
        }
        return false;
    }

    const previousClip = () => {
        if (position.clip > 0) {
            setPosition(prev => ({
                ...prev,
                clip: prev.clip - 1
            }))
            return true;
        }
        return false;
    }

    const selectClip = (clipIndex) => {
        if (clipIndex === position.clip)
            return false;

        setPosition(prev => ({
            ...prev,
            clip: clipIndex
        }))
        return true
    }

    const getRandomClipIndex = (section) => {
        return Math.floor(
            Math.random() * section.clips.length
        )
    }

    const nextSection = () => {

        if (position.section >= sections.length - 1) return false

        const nextSectionIndex = position.section + 1;
        const targetSection = sections[nextSectionIndex];
        let clipIndex = 0;

        if (targetSection.type === "random") {
            clipIndex = getRandomClipIndex(targetSection)
        }

        setPosition({
            section: nextSectionIndex,
            clip: clipIndex
        })

        return true
    }

    const previousSection = () => {
        if (position.section <= 0) return false;

        const prevSectionIndex = position.section - 1;
        const targetSection = sections[prevSectionIndex]
        let clipIndex = 0;

        if (targetSection.type === "random") {
            clipIndex = getRandomClipIndex(targetSection)
        }

        setPosition({
            section: prevSectionIndex,
            clip: clipIndex
        })
        return true
    }

    const goToSection = (sectionIndex) => {
        if (sectionIndex === position.section)
            return false;

        const targetSection = sections[sectionIndex]
        let clipIndex = 0

        if (targetSection.type === "random") {
            clipIndex = getRandomClipIndex(targetSection)
        }

        setPosition({
            section: sectionIndex,
            clip: clipIndex
        })
        return true
    }

    const switchWithTransition = (callback) => {
        if (isTransitioning) return;

        setIsTransitioning(true)
        setPendingTransition(true)

        setTimeout(() => {
            const changed = callback()

            if (!changed) {
                setIsTransitioning(false)
                setPendingTransition(false)
            }
        }, 250);

        setTimeout(() => {
            setIsTransitioning(false);
            setPendingTransition(false);
        }, 2000);

    }

    const togglePlayPause = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play()
        } else {
            videoRef.current.pause()
        }
    }

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;

        setCurrentTime(videoRef.current.currentTime)
    }

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;

        setDuration(videoRef.current.duration)
    }

    const handleSeek = (event, newValue) => {
        if (!videoRef.current) return;

        videoRef.current.currentTime = newValue

        setCurrentTime(newValue)
    }

    const handleVideoEnded = () => {
        if (!currentSection) return;

        const hasMoreClips = position.clip < currentSection.clips.length - 1;
        const hasMoreSections = position.section < sections.length - 1

        if (currentSection.type === 'choice' || currentSection.type === 'random') {
            switchWithTransition(nextSection);
        } else {
            if (hasMoreClips) {
                switchWithTransition(nextClip);
            } else if (hasMoreSections) {
                switchWithTransition(nextSection);
            } else {
                setIsTransitioning(false);
                setPendingTransition(false)
            }
        }

    }

    const handleVideoLoaded = () => {

        setCurrentTime(0);

        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }

        if (pendingTransition) {
            setIsTransitioning(false);
            setPendingTransition(false);
        }
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false)

    if (loadError) {
        return (
            <Container maxWidth='sm' sx={{ pt: 10 }}>
                <Alert severity='error' variant='outlined'>
                    {loadError}
                </Alert>
            </Container>
        )
    }

    if (sections.length === 0) {
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
                            {flowName
                                ? `Playing: ${flowName}`
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
                            clipKey={videoKey}
                            videoRef={videoRef}
                            src={currentVideo}
                            isTransitioning={isTransitioning}
                            onEnded={handleVideoEnded}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onLoadedData={handleVideoLoaded}
                            onPlay={handlePlay}
                            onPause={handlePause}
                        />

                        <VideoControls
                            isPlaying={isPlaying}
                            currentTime={currentTime}
                            duration={duration}
                            onTogglePlay={togglePlayPause}
                            onSeek={handleSeek}
                        />
                    </Stack>

                    <Timeline
                        sections={sections}
                        currentSectionIndex={position.section}
                        onSectionSelect={(index) => switchWithTransition(
                            () => goToSection(index)
                        )}
                        selectedClip={position.clip}
                        onSelectClip={(index) => switchWithTransition(
                            () => selectClip(index)
                        )}
                        maxHeight={leftColumnHeight}
                    />
                </Stack>

                <GlobalProgress
                    currentTime={globalCurrentTime}
                    totalDuration={totalDuration}
                />

                <NavigationPanel
                    onPrevSection={() => switchWithTransition(previousSection)}
                    onPrevClip={() => switchWithTransition(previousClip)}
                    onNextClip={() => switchWithTransition(nextClip)}
                    onNextSection={() => switchWithTransition(nextSection)}
                    onReload={loadVideoStructure}
                    canGoPreviousSection={canGoPreviousSection}
                    canGoNextClip={canGoNextClip}
                    canGoPreviousClip={canGoPreviousClip}
                    canGoNextSection={canGoNextSection}
                />


            </Stack>
        </Container>
    )
}

export default VideoPage
