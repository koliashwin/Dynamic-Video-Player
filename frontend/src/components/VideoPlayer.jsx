import React from 'react'

const VideoPlayer = ({
    videoRef,
    src,
    isTransitioning,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onLoadedData,
    onPlay,
    onPause
}) => {
    return (
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
                src={src}
                width={800}
                controls={false}
                onEnded={onEnded}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onLoadedData={onLoadedData}
                onPlay={onPlay}
                onPause={onPause}
                style={{
                    width: "100%",
                    // height: "100%",
                    objectFit: "cover"
                }}
            />

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
    )
}

export default VideoPlayer
