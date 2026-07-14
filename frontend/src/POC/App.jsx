import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

/*
--------------------------------------------------

Dynamic Video Prototype

Goal:
Treat a video as a navigable document
instead of a single linear file.

Current Features:
- Section navigation
- Clip navigation
- Custom controls
- Transition overlay
- Auto playback

Known Limitations:
- Progress bar is clip-based
- No global timeline
- No clip preloading
- No Media Source Extensions (MSE)

--------------------------------------------------
*/

function App() {
    // custom player state
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    // Transition overlay state
    // used to hid clip switching/loading between videos
    const [isTransitioning, setIsTransitioning] = useState(false)

    // indicates that clip switch is currently ongoing
    // prevent overlay form disappearing before new video loads
    const [pendingTransition, setPendingTransition] = useState(false)

    // video content structure returned from backend
    const [sections, setSections] = useState([]);

    // current video clip posint inside content structure
    // section -> chapter
    // clip -> item inside chapter
    const [position, setPosition] = useState({
        section: 0,
        clip: 0
    })


    const videoRef = useRef(null);

    // initial content fetch 
    // loads section/clip structure form backend
    useEffect(() => {
        loadVideoStructure();
    }, [])

    // fetchs video document structure
    // future versions may include metadata like : duration, thumbnail, tags, clip types, etc
    const loadVideoStructure = async () => {
        try {
            const response = await fetch(
                "http://localhost:8000/videos"
            );

            const data = await response.json();
            setSections(data.sections);

            setPosition({
                section: 0,
                clip: 0
            });
        } catch (error) {
            console.error(error)
        }
    };

    // resolves currently active section and clip
    // this drives the single video element
    const currentSection = sections[position.section]
    const curretnVideo = currentSection?.clips[position.clip]

    // move within current section
    // example: 
    // Projects -> Project A -> project B
    const nexClip = () => {
        if (!currentSection) return;

        if (position.clip < currentSection.clips.length - 1) {
            setPosition(prev => ({
                ...prev,
                clip: prev.clip + 1
            }))
        }
    }

    // move backward inside section
    const previoutClip = () => {
        if (position.clip > 0) {
            setPosition(prev => ({
                ...prev,
                clip: prev.clip - 1
            }))
        }
    }

    // move to next section
    // eg. Projects -> Experiences
    const nextSection = () => {
        if (position.section < sections.length - 1) {
            setPosition(prev => ({
                section: prev.section + 1,
                clip: 0
            }))
        }
    }

    // move to prev section
    const previousSection = () => {
        if (position.section > 0) {
            setPosition(prev => ({
                section: prev.section - 1,
                clip: 0
            }))
        }
    }

    // custom play/pause control
    // browser controles are disabled
    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }

    // sync progress slider wiht video playback
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    }

    // capture clip duration once metadata loads
    // used by progress slider
    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    }

    // allow user to seek within current clip
    const handleSeek = (e) => {
        if (!videoRef.current) return;

        const newTime = Number(e.target.value);

        videoRef.current.currentTime = newTime;

        setCurrentTime(newTime);
    }

    // called when current clip finishes
    // 
    // current experimental strategy:
    // 
    // 1. show black overlay
    // 2. switch clip after short delay
    // 3. wait for next video to load
    // 4. remove overlay
    // 
    // this prevents visible layout shifting and reduces perceived fliker between clips
    const handleVideoEnded = () => {
        if (!currentSection) return;

        setIsTransitioning(true);
        setPendingTransition(true)

        setTimeout(() => {
            const hasMoreClips = position.clip < currentSection.clips.length - 1;

            if (hasMoreClips) {
                setPosition(prev => ({
                    ...prev,
                    clip: prev.clip + 1
                }))
            } else {
                const hasMoreSections = position.section < sections.length - 1;

                if (hasMoreSections) {
                    setPosition(prev => ({
                        section: prev.section + 1,
                        clip: 0
                    }))
                }
            }

            // setTimeout(() => {
            //     setIsTransitioning(false)
            // }, 250);

        }, 250);
    }

    // called when browser has loaded enough data for next clip
    // 
    // overlay remains visible until this fires
    // 
    // without this logic the overlay disappears before the next video is ready
    const handleVideoLoaded = () => {
        console.log(videoRef.current?.clientHeight)
        if (pendingTransition) {
            setIsTransitioning(false);
            setPendingTransition(false);
        }
    }

    // whenever active clip changes, continue playback automatically.
    // 
    // Important: do not call video.load() here
    // 
    // earlier experiments showed that load() caused layout collapse and visible fliker
    useEffect(() => {
        if (!videoRef.current) return;

        // setCurrentTime(0);
        // setDuration(0)

        // videoRef.current.load();
        videoRef.current
            .play()
            // .then(() => setIsPlaying(true))
            .catch(() => { });

    }, [curretnVideo])

    if (sections.length === 0) {
        return <h2>loading ...</h2>;
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                padding: '20px'
            }}
        >
            <h1>Dynamic Video Prototype</h1>

            <div>
                <strong>Section: </strong>{" "}
                {position.section + 1}/{sections.length}
                {" - "}
                {currentSection?.title}
            </div>
            <div>
                <strong>Clip: </strong>{" "}
                {position.clip + 1}/{currentSection?.clips.length}
            </div>

            {/* 
                fixed-size video container

                earliear versions allowed the video element to collapse while switching clips

                keeping a fixed with/height prevents page shifing during clip transitions
            */}
            <div
                style={{
                    position: "relative",
                    width: "800px",
                    height: "450px",
                    background: "black",
                    overflow: "hidden"
                }}
            >
                {/* 
                    single reusable video element

                    clips are swapped by changing src

                    current prototype intentionally uses one video element rather than Media Source Extensions (MSE)
                */}
                <video
                    ref={videoRef}
                    src={curretnVideo}
                    width={800}
                    controls={false}
                    onEnded={handleVideoEnded}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onLoadedData={handleVideoLoaded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{
                        // display: "block",
                        width: "100%",
                        // height: "100%",
                        // height: "450px",
                        objectFit: "cover"
                    }}
                />
                    {/* <source
                        src={curretnVideo}
                        type='video/mp4'
                    /> */}
                {/* </video> */}
                
                {/* 
                    Transition overlay, used to mask source swithcing.

                    Future versions may replace this with:
                    - fade animation
                    - branded transition
                    - loading indicator
                    - section splash screen
                */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "black",
                        opacity: isTransitioning ? 1 : 0,
                        pointerEvents: "none",
                        transition: "opacity 250ms ease-in-out"
                    }}
                />
            </div>

            {/* 
                video navigation options
            */}
            <div
                style={{
                    width: "800px",
                    display: 'flex',
                    flexDirection: 'column',
                    gap: "10px",
                }}
            >
                <button onClick={togglePlayPause}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
                <input type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{ width: "100%" }}
                />
                <div>
                    {Math.floor(currentTime)}/{Math.floor(duration)} sec
                </div>
                <button onClick={previousSection}>Prev Section</button>
                <button onClick={previoutClip}>Prev Clip</button>
                <button onClick={nexClip}>Next Clip</button>
                <button onClick={nextSection}>Next Section</button>
                <button onClick={loadVideoStructure}>reload Structure</button>
            </div>

        </div>
    )
}

export default App
