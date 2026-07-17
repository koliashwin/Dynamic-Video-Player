import React from 'react'

const GlobalProgress = ({
    currentTime,
    totalDuration
}) => {

    const percentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

    return (
        <div
            style={{width: '800px'}}
        >
            <div
                style={{
                    height: "10px",
                    background: "#ddd",
                    borderRadius: "10px",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "#1976d2",
                        transition: "width 150ms linear"
                    }}
                />
            </div>
            <div style={{ marginTop: "6px" }}>
                {Math.floor(currentTime)}
                {" / "}
                {Math.floor(totalDuration)} sec
            </div>
        </div>
    )
}

export default GlobalProgress
