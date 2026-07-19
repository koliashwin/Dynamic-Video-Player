import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import React from 'react'
import { formatTimecode } from '../utils/formatTimecode';

const GlobalProgress = ({
    currentTime,
    totalDuration
}) => {

    const percentage = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

    return (
        <Box sx={{width: '100%'}}>
            <Stack direction="row" sx={{ mb: 0.75, justifyContent: 'space-between' }}>
                <Typography
                    sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: 'text.secondary'
                    }}
                >
                    PROGRAM TIME
                </Typography>
                <Typography
                    sx={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: 12,
                        color: 'text.secondary'
                    }}
                >
                    {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
                </Typography>
            </Stack>
            <LinearProgress
                variant='determinate'
                value={percentage}
                sx={{height: 6}}
            />
        </Box>
    )
}

export default GlobalProgress
