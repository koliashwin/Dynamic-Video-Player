import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import { getVideoStructure } from './services/videoService';
import VideoPlayer from './components/VideoPlayer';
import VideoControls from './components/VideoControls';
import NavigationPanel from './components/NavigationPanel';
import ChoiceSection from './components/ChoiceSection';
import Timeline from './components/Timeline';

const App = () => {

    const videoRef = useRef(null);

    const [sections, setSections] = useState([])
    const [position, setPosition] = useState({
        section: 0,
        clip: 0
    })

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [pendingTransition, setPendingTransition] = useState(false)


    useEffect(() => {
        loadVideoStructure();
    }, []);

    const loadVideoStructure = async () => {
        try {
            const data = await getVideoStructure();

            setSections(data.sections);

            setPosition({
                section: 0,
                clip: 0
            })

            setIsTransitioning(false)
            setPendingTransition(false)

        } catch (error) {
            console.error(error)
        }
    };

    const currentSection = sections[position.section];
    const currentVideo = currentSection?.clips[position.clip]?.url

    const canGoPreviousSection = position.section > 0
    const canGoNextSection = position.section < sections.length - 1
    const canGoPreviousClip = position.clip > 0
    const canGoNextClip = position.clip < currentSection?.clips.length - 1

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

    const nextSection = () => {
        if (position.section < sections.length - 1) {
            setPosition(prev => ({
                section: prev.section + 1,
                clip: 0
            }))
            return true;
        }
        return false;
    }

    const previousSection = () => {
        if (position.section > 0) {
            setPosition(prev => ({
                section: prev.section - 1,
                clip: 0
            }))
            return true;
        }
        return false;
    }

    const goToSection = (sectionIndex) => {
        if (sectionIndex === position.section)
            return false;

        setPosition({
            section: sectionIndex,
            clip: 0
        })
        return true
    }

    const switchWithTransition = (callback) => {
        setIsTransitioning(true)
        setPendingTransition(true)

        setTimeout(() => {
            const changed = callback()

            if (!changed) {
                setIsTransitioning(false)
                setPendingTransition(false)
            }
        }, 250);


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

    const handleSeek = (e) => {
        if (!videoRef.current) return;

        const newTime = Number(e.target.value)
        videoRef.current.currentTime = newTime

        setCurrentTime(newTime)
    }

    const handleVideoEnded = () => {
        if (!currentSection) return;

        // setIsTransitioning(true)
        // setPendingTransition(true)

        const hasMoreClips = position.clip < currentSection.clips.length - 1;
        const hasMoreSections = position.section < sections.length - 1

        if (currentSection.type === 'choice') {
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
        if (pendingTransition) {
            setIsTransitioning(false);
            setPendingTransition(false);
        }
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false)

    useEffect(() => {
        if (!videoRef.current) return;

        setCurrentTime(0)
        setDuration(0)

        videoRef.current.play().catch(() => { });

    }, [currentVideo]);

    if (sections.length === 0) {
        return <h2>Loading...</h2>;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                padding: '20px'
            }}
        >
            <h1>Dynamic Video Prototype</h1>

            <Timeline
                sections={sections}
                currentSectionIndex={position.section}
                onSectionSelect={(index) => switchWithTransition(
                    () => goToSection(index)
                )}
            />

            {
                currentSection?.type === "choice" && (
                    <ChoiceSection
                        clips={currentSection.clips}
                        selectedClip={position.clip}
                        onSelectClip={(index) => switchWithTransition(
                            () => selectClip(index)
                        )}
                    />
                )
            }

            {/* <div>
                <strong>Section:</strong>
                {" "}
                {position.section + 1}
                /
                {sections.length}
                {" - "}
                {currentSection?.title}
            </div>

            <div>
                <strong>Clip:</strong>
                {" "}
                {position.clip + 1}
                /
                {currentSection?.clips.length}
            </div> */}

            <VideoPlayer
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
        </div>
    )
}

export default App
