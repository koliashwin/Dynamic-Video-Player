import React from 'react'

const NavigationPanel = ({
    onPrevSection,
    onPrevClip,
    onNextClip,
    onNextSection,
    onReload,
    canGoNextSection,
    canGoPreviousSection,
    canGoNextClip,
    canGoPreviousClip
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
            <button onClick={onPrevSection} disabled={!canGoPreviousSection}>Prev Section</button>
            <button onClick={onPrevClip} disabled={!canGoPreviousClip}>Prev Clip</button>
            <button onClick={onNextClip} disabled={!canGoNextClip}>Next Clip</button>
            <button onClick={onNextSection} disabled={!canGoNextSection}>Next Section</button>
            <button onClick={onReload}>reload Structure</button>
        </div>
    )
}

export default NavigationPanel
