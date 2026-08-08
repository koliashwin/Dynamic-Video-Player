
export const getSectionDuration = (
    section,
    mode = null
) => {

    if (!section || !section.clips || section.clips.length === 0) return 0;

    if (section.type === 'single') {
        // sectoin duration = sum of all the clips
        return section.clips.reduce((sum, clip) => sum + (clip.duration || 0), 0)
    }

    if (section.type === 'choice' || section.type === 'random') {
        if (mode === 'average') {
            const total = section.clips.reduce((sum, clip) => sum + (clip.duration || 0), 0)
            return total/section.clips.length
        }
        if (Array.isArray(mode)) {
            return mode.reduce((sum, clipIndex) => {
                const clip = section.clips[clipIndex]
                return sum + (clip?.duration || 0)
            }, 0)
        }
        if (typeof mode === 'number' && section.clips[mode]) {
            return section.clips[mode].duration || 0
        }
        // unknown = fall back to longest as rough ceiling
        return Math.max(...section.clips.map(clip => clip.duration || 0))
    }

    return 0
}

export const getBaselineTotalDuration = (sections) => {
    return sections.reduce((total, section) => total + getSectionDuration(section, 'average'), 0)
}

export const getPaceDelta = (sections, position, visitedClipBySection = {}) => {
    let delta = 0;

    for (let sectionIndex = 0; sectionIndex < position.section; sectionIndex++) {
        const section = sections[sectionIndex];
        const baseline = getSectionDuration(section, 'average');

        const visited = visitedClipBySection[sectionIndex];
        const actual = visited ? getSectionDuration(section, visited) : 0;
        
        delta += (actual - baseline)
    }

    return delta;
}

// export const getEstimatedTotalDuration = (
//     sections,
//     currentPosition,
//     visitedClipBySection = {}
// ) => {
//     return sections.reduce((total, section, sectionIndex) => {

//         let clipIndex = null;

//         if (sectionIndex === currentPosition.section) {
//             clipIndex = currentPosition.clip;
//         } else if (sectionIndex in visitedClipBySection) {
//             clipIndex = visitedClipBySection[sectionIndex]
//         }

//         return (total + getSectionDuration(section, clipIndex));

//     }, 0)
// }

export const getEstimatedElapsedDuration = (
    sections,
    position,
    currentTime,
    visitedClipBySection = {}
) => {
    
    let elapsed = 0;

    for (let sectionIndex = 0; sectionIndex < position.section; sectionIndex++){
        const visited = visitedClipBySection[sectionIndex]

        elapsed += visited ? getSectionDuration(sections[sectionIndex], visited) : 0;
    }

    const currentSection = sections[position.section];
    if (currentSection?.type === 'single') {
        const completedClips = currentSection.clips.slice(0, position.clip);
        elapsed += completedClips.reduce((sum, clip) => sum + (clip.duration || 0), 0);
    }
    if (currentSection?.type === 'choice') {
        const visited = visitedClipBySection[position.section] || [];
        const alreadyWatchedOthers = visited.filter(clipIndex => clipIndex !== position.clip);
        elapsed += alreadyWatchedOthers.reduce((sum, clipIndex) => {
            const clip = currentSection.clips[clipIndex];
            return sum + (clip?.duration || 0)
        }, 0)
    }

    return elapsed + currentTime;
}