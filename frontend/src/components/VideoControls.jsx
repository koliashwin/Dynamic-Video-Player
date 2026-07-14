import React from 'react'

const VideoControls = ({
    isPlaying,
    currentTime,
    duration,
    onTogglePlay,
    onSeek
}) => {
    return (
        <div
            style={{
                width: "800px",
                display: 'flex',
                flexDirection: 'column',
                gap: "10px",
            }}
        >
            <button onClick={onTogglePlay}>
                {isPlaying ? "Pause" : "Play"}
            </button>
            <input type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={onSeek}
                style={{ width: "100%" }}
            />
            <div>
                {Math.floor(currentTime)}/{Math.floor(duration)} sec
            </div>
        </div>
    )
}

export default VideoControls
