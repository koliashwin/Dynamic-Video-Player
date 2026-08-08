import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import React from 'react'
import { palette } from '../theme'
import ChoiceSection from './ChoiceSection'

const sprockedColumn = {
    width: 5,
    flexShrink: 0,
    backgroundImage: 'radial-gradient(circle at 1px 8px, #f5ea72 1px, transparent 10px)',
    backgroundSize: '10px 25px',
    backgroundRepeat: 'repeat-y',
    opacity: 0.3
}

const Timeline = ({
    sections,
    currentSectionIndex,
    onSectionSelect,
    selectedClip,
    onSelectClip,
    maxHeight
}) => {
    return (
        <Box sx={{
            display: 'flex',
            width: { xs: 12, md: 240 },
            flexShrink: 0,
            alignSelf: 'stretch',
            maxHeight: maxHeight || 'none',
            minHeight: 0
        }}>
            <Box sx={sprockedColumn} />

            <Stack
                spacing={1}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'linear-gradient(180deg, #1B1D21 0%, #15171A 100%)',
                    px: 0.75,
                    py: 1,
                    minWidth: 0
                }}
            >
                {sections.map((section, index) => {
                    const isActive = index === currentSectionIndex
                    const isChoice = section.type === 'choice'
                    const isRandom = section.type === 'random'

                    return (
                        <Box key={section.id}>
                            <ButtonBase
                                // key={section.id}
                                onClick={() => onSectionSelect(index)}
                                sx={{
                                    width: '100%',
                                    py: 1,
                                    px: 1.25,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: isActive ? palette.filmAmber : 'divider',
                                    backgroundColor: isActive
                                        ? 'rgba(227, 166, 74, 0.12)'
                                        : 'rgba(255,255,255, 0.05)',
                                    boxShadow: isActive
                                        ? `0 0 0 1px ${palette.filmAmber}55, 0 0 14px ${palette.filmAmber}33`
                                        : 'none',
                                    transition: 'all 160ms ease',
                                    '&:hover': {
                                        backgroundColor: isActive
                                            ? 'rgba(227, 166, 74, 0.26)'
                                            : 'rgba(255,255,255, 0.15)',
                                    }
                                }}
                            >
                                <Stack spacing={0.25} sx={{ width: '100%', alignItems: 'flex-start' }}>
                                    <Typography
                                        sx={{
                                            fontFamily: '"IBM Plex Mono", monospace',
                                            fontSize: 11,
                                            color: isActive ? palette.filmAmber : 'text.secondary',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        Section {String(index + 1).padStart(2, '0')}
                                    </Typography>
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            fontSize: 14,
                                            lineHeight: 1.2,
                                            color: isActive ? 'text.primary' : 'text.secondary',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {section.title}
                                    </Typography>

                                    {isChoice && (
                                        <Typography
                                            sx={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                letterSpacing: '0.08em',
                                                color: palette.reelTeal
                                            }}
                                        >
                                            ● BRANCH
                                        </Typography>
                                    )}

                                    {isRandom && (
                                        <Typography
                                            sx={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                letterSpacing: '0.08em',
                                                color: 'text.secondary'
                                            }}
                                        >
                                            ⟲ RANDOM DRAW
                                        </Typography>
                                    )}

                                </Stack>
                            </ButtonBase>

                            {isActive && isChoice && (
                                <Box sx={{ mt: 0.75 }}>
                                    <ChoiceSection
                                        clips={section.clips}
                                        onSelectClip={onSelectClip}
                                        selectedClip={selectedClip}
                                    />
                                </Box>
                            )}

                        </Box>
                    )
                })}
            </Stack>

            <Box sx={sprockedColumn} />
        </Box>
    )
}

export default Timeline
