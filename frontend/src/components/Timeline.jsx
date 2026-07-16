import React from 'react'

const Timeline = ({
    sections,
    currentSectionIndex,
    onSectionSelect
}) => {
  return (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "800px",
            marginBottom: "20px"
        }}
    >
      {sections.map((section, index) => (
        <React.Fragment key={section.id}>
            <button
                onClick={() => onSectionSelect(index)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    background: index === currentSectionIndex ? '#1976d2' : '#fff',
                    color: index === currentSectionIndex ? '#fff' : '#000'
                }}
            >
                {section.title}
            </button>

            {
                index < sections.length - 1 && (
                    <div
                        style={{
                            flex: 1,
                            height: '2px',
                            background: "#ccc"
                        }}
                    />
                )
            }
        </React.Fragment>
      ))}
    </div>
  )
}

export default Timeline
