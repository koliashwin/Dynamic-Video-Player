import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import React from 'react'
import { formatTimecode } from '../utils/formatTimecode';
import {palette} from '../theme'

const GlobalProgress = ({
    currentTime,
    estimatedTotal,
    paceDelta = 0
}) => {

    const percentage = estimatedTotal > 0 ? Math.min(100, (currentTime / estimatedTotal) * 100) : 0;
    const roundedDelta = Math.round(paceDelta);
    const showDelta = Math.abs(roundedDelta) >= 1;

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
                    ~{formatTimecode(estimatedTotal)}
                    {showDelta && (
                        <Box
                            component="span"
                            sx={{
                                ml: 0.75,
                                color: roundedDelta > 0 ? palette.filmAmber : palette.reelTeal
                            }}
                        >
                            {roundedDelta > 0 ? '+' : '-'}{formatTimecode(Math.abs(roundedDelta))}
                        </Box>
                    )}
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
