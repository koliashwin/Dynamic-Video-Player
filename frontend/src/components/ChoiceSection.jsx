import React from 'react'

const ChoiceSection = ({
    clips,
    selectedClip,
    onSelectClip,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px'
            }}
        >
            {clips.map((clip, index) => (
                <button
                    key={clip.id}
                    onClick={() => onSelectClip(index)}
                    style={{
                        fontWeight: selectedClip === index ? "bold" : "normal"
                    }}
                >
                    {clip.title}
                </button>
            ))}
        </div>
    )
}

export default ChoiceSection
