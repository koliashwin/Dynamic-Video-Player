import { createTheme } from '@mui/material/styles'

/*
    Dynamic Video Player — theme
    -----------------------------------
    Identity: a screening-room / editing-suite, not a generic dark dashboard.

    - `filmAmber`  → "playing" state, primary actions, the active frame on the filmstrip
    - `reelTeal`   → reserved for branch / choice moments ("tally light" — a decision is live)
    - dark stage   → functional, not decorative: keeps focus on the video, avoids
                      halation around the frame the way an edit bay would

    Any new component should pull colors/type from here rather than hardcoding
    hex values, so the whole app stays visually consistent as it grows.
*/

const filmAmber = '#E3A64A'
const reelTeal = '#4A8C93'

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: filmAmber,
            contrastText: '#0E1013'
        },
        secondary: {
            main: reelTeal,
            contrastText: '#0E1013'
        },
        background: {
            default: '#0E1013',
            paper: '#17191D'
        },
        text: {
            primary: '#EEEAE1',
            secondary: '#8A8D93'
        },
        divider: '#292C31',
        action: {
            disabledBackground: 'rgba(238, 234, 225, 0.06)',
            disabled: 'rgba(238, 234, 225, 0.28)'
        }
    },
    shape: {
        borderRadius: 10
    },
    typography: {
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        h1: {
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
        },
        h2: {
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 500,
            letterSpacing: '0.03em'
        },
        subtitle1: {
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 500,
            letterSpacing: '0.02em'
        },
        button: {
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: '0.01em'
        }
    },
    // dedicated slot for timecode / numeric readouts used across the player
    typographyTimecode: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em'
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#0E1013',
                    backgroundImage:
                        'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(227,166,74,0.06), transparent 60%)'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#EEEAE1',
                    '&:hover': {
                        backgroundColor: 'rgba(227,166,74,0.12)'
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                }
            }
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: filmAmber,
                    height: 4
                },
                thumb: {
                    width: 14,
                    height: 14,
                    boxShadow: '0 0 0 4px rgba(227,166,74,0.15)',
                    '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 7px rgba(227,166,74,0.2)'
                    }
                },
                rail: {
                    opacity: 1,
                    backgroundColor: '#292C31'
                }
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    backgroundColor: '#202327'
                },
                bar: {
                    borderRadius: 999
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#1F2226',
                    fontSize: '0.72rem',
                    fontFamily: '"Inter", sans-serif'
                }
            }
        }
    }
})

export const palette = { filmAmber, reelTeal }

export default theme
