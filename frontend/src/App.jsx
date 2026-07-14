import React, { useEffect, useRef, useState } from 'react'
import { getVideoStructure } from './services/videoService';
import VideoPlayer from './components/VideoPlayer';
import VideoControls from './components/VideoControls';
import NavigationPanel from './components/NavigationPanel';

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
        } catch (error) {
            console.error(error)
        }
    };

    const currentSection = sections[position.section];
    const currentVideo = currentSection?.clips[position.clip]

    const nextClip = () => {
        if(!currentSection) return;

        if (position.clip < currentSection.clips.length - 1) {
            setPosition(perv => ({
                ...perv,
                clip: perv.clip + 1
            }));
        }
    }

    const previousClip = () => {
        if (position.clip > 0){
            setPosition(prev => ({
                ...prev,
                clip: prev.clip -1
            }))
        }
    }

    const nextSection = () => {
        if (position.section < sections.length -1) {
            setPosition(prev => ({
                section: prev.section + 1,
                clip: 0
            }))
        }
    }

    const previousSection = () => {
        if (position.section > 0) {
            setPosition(prev => ({
                section: prev.section - 1,
                clip: 0
            }))
        }
    }

    const togglePlayPause = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused){
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

        setIsTransitioning(true)
        setPendingTransition(true)

        setTimeout(() => {
            const hasMoreClips = position.clip < currentSection.clips.length - 1;

            if (hasMoreClips) {
                nextClip();
            } else {
                nextSection();
            }

        }, 250);
    }

    const handleVideoLoaded = () => {
        if (pendingTransition) {
            setIsTransitioning(false);
            setPendingTransition(false);
        }
    }

    useEffect(() => {
        if (!videoRef.current) return;

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

            <div>
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
            </div>

            <VideoPlayer
                videoRef={videoRef}
                src={currentVideo}
                isTransitioning={isTransitioning}
                onEnded={handleVideoEnded}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLoadedData={handleVideoLoaded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <VideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlayPause}
                onSeek={handleSeek}
            />

            <NavigationPanel
                onPrevSection={previousSection}
                onPrevClip={previousClip}
                onNextClip={nextClip}
                onNextSection={nextSection}
                onReload={loadVideoStructure}
            />
        </div>
    )
}

export default App
