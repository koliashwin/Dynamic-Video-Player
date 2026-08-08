import React from 'react'
import { Link as RouterLink} from 'react-router-dom'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { PlayArrowRounded, TuneRounded } from '@mui/icons-material'
import { palette } from '../theme'
import Footer from '../components/Footer'

const sectionTypeCards = [
    {
        label: 'SINGLE',
        color: 'text.secondary',
        title: 'Linear sections',
        description: 'Clips play back to back in order. The straightforward building block for any stretch that doesn\'t branch.'
    },
    {
        label: '● BRANCH',
        color: palette.reelTeal,
        title: 'Choice sections',
        description: 'The viewer can pick a path. Each option is its own clip and user can choose which to play.'
    },
    {
        label: '⟲ RANDOM DRAW',
        color: 'text.secondary',
        title: 'Random sections',
        description: 'One clip is drawn at random from the set. The same sections can feel different on repeated watch'
    },
]

const LandingPage = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Container maxWidth='md' sx={{ pt: { xs: 6, sm: 4 }, pb: 3, flex: 1 }}>
                <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center'}}>
                    <Typography
                        sx={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: 11,
                            letterSpacing: '0.15em',
                            color: palette.filmAmber
                        }}
                    >
                        ● REC : DYNAMIC VIDEO PLAYER
                    </Typography>
                    <Typography variant='h1' sx={{ fontSize: { xs: 32, sm: 46 }, lineHeight: 1.15}}>
                        Video that branches <br />as you watch
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 16, maxWidth: 560 }}>
                        A small engine for building non-linear video experiences. Chain clips into sections,
                        let viewers choose there own path or leave it to chance. no single uploads 
                        playes the same way twice.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row'}} spacing={1.5} sx={{ pt: 2 }}>
                        <Button
                            component={RouterLink}
                            to="/feed"
                            variant='contained'
                            size='large'
                            startIcon={<PlayArrowRounded />}
                            sx={{ backgroundColor: palette.filmAmber }}
                        >
                            Browse Flows
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/config/clips"
                            variant='outlined'
                            size='large'
                            startIcon={<TuneRounded />}
                            sx={{ borderColor: 'divider', color: 'text.primary' }}
                        >
                            Configuration Panel
                        </Button>
                    </Stack>
                </Stack>

                <Stack spacing={2} sx={{ mt: {xs: 4, sm: 6 } }}>
                    <Typography
                        sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            color: 'text.secondary',
                            textAlign: 'center'
                        }}
                    >
                        Three Ways A Section Can Play
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row'}} spacing={2}>
                        {sectionTypeCards.map((card) => (
                            <Box
                                key={card.title}
                                sx={{
                                    flex: 1,
                                    p: 2.5,
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'rgba(255,255,255,0.03)'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        color: card.color,
                                        mb: 1
                                    }}
                                >
                                    {card.label}
                                </Typography>
                                <Typography variant='subtitle1' sx={{ fontSize: 16, mb: 0.5, textTransform: 'uppercase'}}>
                                    {card.title}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: 'tex.secondary', lineHeight: 1.6}}>
                                    {card.description}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Container>

            <Footer />
        </Box>
    )
}

export default LandingPage
