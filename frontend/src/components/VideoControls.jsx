import { Box, IconButton, Slider, Stack, Typography } from '@mui/material'
import { PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import React from 'react'
import { palette } from '../theme'
import { formatTimecode } from '../utils/formatTimecode'

const timecodeSx = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 13,
    color: 'text.secondary',
    minWidth: 44
}

const VideoControls = ({
    isPlaying,
    currentTime,
    duration,
    onTogglePlay,
    onSeek
}) => {
    return (
        <Box sx={{ width: '100%'}}>
            <Stack direction='row' spacing={1.5} sx={{alignItems: 'center'}} >
                <IconButton
                    onClick={onTogglePlay}
                    sx={{
                        backgroundColor: 'rgba(227, 166, 74, 0.12)',
                        border: `1px solid ${palette.filmAmber}55`,
                        '&:hover': {backgroundColor: 'rgba(227, 166, 74, 0.2)'}
                    }}
                >
                    {isPlaying
                        ? <PauseRounded sx={{ color: palette.filmAmber}} />
                        : <PlayArrowRounded sx={{ color: palette.filmAmber}} />
                    }
                </IconButton>

                <Typography sx={{ ...timecodeSx, textAlign: 'right'}} >
                    {formatTimecode(currentTime)}
                </Typography>

                <Slider
                    size='small'
                    min={0}
                    max={duration || 0}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={onSeek}
                    aria-label='Seek within current clip'
                    sx={{ flex: 1 }}
                />

                <Typography sx={timecodeSx}>
                    {formatTimecode(duration)}
                </Typography>
            </Stack>
        </Box>
    )
}

export default VideoControls
