import React from 'react'

const NavigationPanel = ({
    onPrevSection,
    onPrevClip,
    onNextClip,
    onNextSection,
    onReload
}) => {
    return (
        <div
            style={{
                width: "800px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
            }}
        >
            <button onClick={onPrevSection}>Prev Section</button>
            <button onClick={onPrevClip}>Prev Clip</button>
            <button onClick={onNextClip}>Next Clip</button>
            <button onClick={onNextSection}>Next Section</button>
            <button onClick={onReload}>reload Structure</button>
        </div>
    )
}

export default NavigationPanel
