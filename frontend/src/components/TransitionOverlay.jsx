import { Box } from '@mui/material'
import React from 'react'
import { palette } from '../theme'


// Transition overlay, used to mask source swithcing.

// Future versions may replace this with:
// - fade animation
// - branded transition
// - loading indicator
// - section splash screen


const TransitionOverlay = ({ isTransitioning }) => {
    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0E1013',
                opacity: isTransitioning ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 250ms ease-in-out'
            }}
        >
            <Box
                component='svg'
                viewBox='0 0 60 60'
                sx={{
                    width: 36,
                    height: 36,
                    opacity: isTransitioning ? 0.85 : 0,
                    animation: isTransitioning ? 'leader-spin 1.1s linear infinite' : 'none',
                    '@keyframes leader-spin': {
                        from: { transform: 'rotate(0deg)' },
                        to: { transform: 'rotate(360deg)' }
                    }
                }}
            >
                <circle cx="30" cy="30" r="26" fill="none" stroke={palette.filmAmber} strokeWidth="1.5" />
                <line x1="30" y1="4" x2="30" y2="18" stroke={palette.filmAmber} strokeWidth="1.5" />
                <line x1="30" y1="42" x2="30" y2="56" stroke={palette.filmAmber} strokeWidth="1.5" />
                <line x1="4" y1="30" x2="18" y2="30" stroke={palette.filmAmber} strokeWidth="1.5" />
                <line x1="42" y1="30" x2="56" y2="30" stroke={palette.filmAmber} strokeWidth="1.5" />
            </Box>
        </Box>
    )
}

export default TransitionOverlay
