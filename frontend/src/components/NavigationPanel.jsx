import { NavigateBeforeRounded, NavigateNextRounded, RestartAltRounded, SkipNextRounded, SkipPreviousRounded } from '@mui/icons-material'
import { Box, Divider, IconButton, Stack, Tooltip } from '@mui/material'
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
        <Box sx={{ width: '100%' }}>
            <Stack
                direction="row"
                sx={{
                    px: 1.5,
                    py: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                }}
            >
                <Stack direction='row' spacing={0.5}>
                    <Tooltip title="Previous Section">
                        <span>
                            <IconButton onClick={onPrevSection} disabled={!canGoPreviousSection} size='small'>
                                <SkipPreviousRounded />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Previous Clip">
                        <span>
                            <IconButton onClick={onPrevClip} disabled={!canGoPreviousClip} size='small'>
                                <NavigateBeforeRounded />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Next Clip">
                        <span>
                            <IconButton onClick={onNextClip} disabled={!canGoNextClip} size='small'>
                                <NavigateNextRounded />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Next Section">
                        <span>
                            <IconButton onClick={onNextSection} disabled={!canGoNextSection} size='small'>
                                <SkipNextRounded />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>

                <Divider orientation='vertical' flexItem sx={{ mx: 1 }} />

                <Tooltip title="Reload content structure">
                    <IconButton onClick={onReload} size='small'>
                        <RestartAltRounded fontSize='small' />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    )
}

export default NavigationPanel
