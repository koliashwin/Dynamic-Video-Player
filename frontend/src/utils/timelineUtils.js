
export const getSectionDuration = (
    section,
    selectedClipIndex = 0
) => {

    if (!section) return 0;

    if (
        section.type === 'single' ||
        section.type === 'choice' ||
        section.type === 'random'
    ) {
        // return section.clips[selectedClipIndex]?.duration || 0;
        return Math.max(
            ...section.clips.map(clip => clip.duration)
        )
    }

    return 0
}

export const getEstimatedTotalDuration = (
    sections,
    currentPosition
) => {
    return sections.reduce((total, section, sectionIndex) => {

        let clipIndex = 0;

        if (sectionIndex === currentPosition.section) {
            clipIndex = currentPosition.clip;
        }

        return (total + getSectionDuration(section, clipIndex));

    }, 0)
}

export const getEstimatedElapsedDuration = (
    sections,
    position,
    currentTime
) => {
    
    let elapsed = 0;

    for (let sectionIndex = 0; sectionIndex < position.section; sectionIndex++){
        const section = sections[sectionIndex]

        elapsed += section.clips[0]?.duration || 0;
    }

    // elapsed += currentTime;

    return elapsed + currentTime;
}