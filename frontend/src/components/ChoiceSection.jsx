import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import React from 'react'
import { palette } from '../theme'
import { PlayCircleOutlineRounded } from '@mui/icons-material'

const ChoiceSection = ({
    clips,
    selectedClip,
    onSelectClip,
}) => {
    return (
        <Box 
            sx={{ 
                width: '100%',
                pl: 1,
                ml: 0.5,
                borderLeft: `2px solid ${palette.reelTeal}55`
            }}
        >
            <Typography
                sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: palette.reelTeal,
                    mb: 0.75
                }}
            >
                ● CHOOSE A PATH
            </Typography>

            <Stack spacing={0.75}>
                {clips.map((clip, index) => {
                    const isSelected = selectedClip === index

                    return (
                        <ButtonBase
                            key={clip.id}
                            onClick={() => onSelectClip(index)}
                            sx={{
                                width: '100%',
                                gap: 0.75,
                                py: 0.75,
                                px: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: isSelected ? palette.reelTeal : 'divider',
                                backgroundColor: isSelected
                                    ? 'rgba(74,140,147,0.14)'
                                    : 'rgba(255,255,255,0.02)',
                                boxShadow: isSelected
                                    ? `0 0 0 1px ${palette.reelTeal}66, 0 0 16px ${palette.reelTeal}2e`
                                    : 'none',
                                transition: 'all 160ms ease',
                                justifyContent: 'flex-start',
                                '&:hover': {
                                    backgroundColor: isSelected
                                        ? 'rgba(74,140,147,0.2)'
                                        : 'rgba(255,255,255,0.05)'
                                }
                            }}
                        >
                            <PlayCircleOutlineRounded
                                sx={{
                                    fontSize: 16,
                                    color: isSelected ? palette.reelTeal : 'text.secondary'
                                }} 
                            />

                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    fontWeight: isSelected ? 600 : 400,
                                    color: isSelected ? 'text.primary' : 'text.secondary'
                                }}
                            >
                                {clip.title}
                            </Typography>
                        </ButtonBase>
                    )
                })}
            </Stack>
        </Box>
    )
}

export default ChoiceSection
