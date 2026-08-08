import { useEffect, useRef, useState } from "react";
import { getBaselineTotalDuration, getEstimatedElapsedDuration, getPaceDelta } from "../utils/timelineUtils";
import { getVideoStructure } from "../services/videoService";






export const usePlayableFlow = (flowId) => {
    const videoRef = useRef(null);

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
    const [visitedClipBySection, setVisitedClipBySection] = useState({})
    const [estimatedTotal, setEstimatedTotal] = useState(0)
    const [loadError, setLoadError] = useState(null)
    const transitionFailsafeRef = useRef(null)

    const clearTransitionFailsafe = () => {
        if (transitionFailsafeRef.current) {
            clearTimeout(transitionFailsafeRef.current)
            transitionFailsafeRef.current = null
        }
    }

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
            setEstimatedTotal(getBaselineTotalDuration(data.sections))

            setPosition({
                section: 0,
                clip: 0
            })
            setVisitedClipBySection({})

            setIsTransitioning(false)
            setPendingTransition(false)
            clearTransitionFailsafe()

        } catch (error) {
            console.error(error)
            setLoadError(error.message || 'could not reach the video service - either backend is down or flow is not created')
        }
    };

    useEffect(() => {
        loadVideoStructure();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flowId]);

    useEffect(() => {
        setVisitedClipBySection(prev => {
            const existing = prev[position.section] || [];
            if (existing.includes(position.clip)) return prev;      // alread recorded avoid re render
            return { ...prev, [position.section]: [...existing, position.clip] };
        })
    }, [position.section, position.clip])

    const videoKey = `${position.section}-${position.clip}`

    const currentSection = sections[position.section];
    const currentVideo = currentSection?.clips[position.clip]?.url

    const paceDelta = getPaceDelta(sections, position, visitedClipBySection)
    const globalCurrentTime = getEstimatedElapsedDuration(sections, position, currentTime, visitedClipBySection)

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
                clearTransitionFailsafe()
            }
        }, 250);

        clearTransitionFailsafe()
        transitionFailsafeRef.current = setTimeout(() => {
            setIsTransitioning(false);
            setPendingTransition(false);
        }, 8000);

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
            clearTransitionFailsafe();
            setIsTransitioning(false);
            setPendingTransition(false);
        }
    }

    const handleVideoError = () => {
        clearTransitionFailsafe()
        setIsTransitioning(false)
        setPendingTransition(false)
        console.error("Clip failed to load: ", currentVideo)
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false)

    return {
        videoRef,
        sections,
        flowName,
        position,
        isPlaying,
        currentTime,
        duration,
        isTransitioning,
        loadError,      // test afterwords
        estimatedTotal,
        paceDelta,
        globalCurrentTime,
        videoKey,
        currentSection,
        currentVideo,
        canGoPreviousSection,
        canGoNextSection,
        canGoPreviousClip,
        canGoNextClip,
        reload: loadVideoStructure,
        goToSectionWithTransition: (index) => switchWithTransition(() => goToSection(index)),
        selectClipWithTransition: (index) => switchWithTransition(() => selectClip(index)),
        previousSectionWithTransition: (index) => switchWithTransition(previousSection),
        previousClipWithTransition: (index) => switchWithTransition(previousClip),
        nextClipWithTransition: (index) => switchWithTransition(nextClip),
        nextSectionWithTransition: (index) => switchWithTransition(nextSection),
        togglePlayPause,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleSeek,
        handleVideoEnded,
        handleVideoLoaded,
        handleVideoError,
        handlePlay,
        handlePause,
    }
}