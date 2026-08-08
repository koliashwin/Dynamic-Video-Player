import { Link as RouterLink } from 'react-router-dom'
import { GitHub } from '@mui/icons-material'
import { Box, Container, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { palette } from '../theme'

const navLinkSx = {
    fontSize: 13,
    color: 'text.secondary',
    '&:hover': { color: palette.filmAmber }
}
const Footer = () => {
    return (
        <Box component='footer' sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
            <Container maxWidth='lg' sx={{ py: 2 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 3, sm: 4 }}
                    sx={{ justifyContent: 'space-between' }}
                >
                    <Stack spacing={0.75} sx={{ maxWidth: 360 }}>
                        <Typography
                            sx={{
                                fontFamily: '"Oswald", sans-serif',
                                fontSize: 14,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                color: 'text.primary'
                            }}
                        >
                            Dynamic Video Player
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.6 }}>
                            A personal project exploring branching video playback, built end-to-end
                            as a way to dive into non-linear media, not a product.
                        </Typography>
                    </Stack>

                    <Stack direction='row' spacing={{ xs: 4, sm: 6 }}>
                        <Stack spacing={0.75}>
                            <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'text.secondary' }}>
                                EXPLORE
                            </Typography>
                            <Link component={RouterLink} to='/feed' underline='hover' sx={navLinkSx}>
                                Flow Feed
                            </Link>
                            <Link component={RouterLink} to='/config/clips' underline='hover' sx={navLinkSx}>
                                Configuration Panel
                            </Link>
                        </Stack>

                        <Stack spacing={0.75}>
                            <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'text.secondary' }}>
                                BUILT WITH
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace' }}>
                                React • FastAPI
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace' }}>
                                CockroachDB • B2
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace' }}>
                        © {new Date().getFullYear()} - built by Ashwin Koli
                    </Typography>
                    <Tooltip title='GitHub'>
                        <IconButton
                            component='a'
                            href='https://github.com/koliashwin'
                            target='_blank'
                            rel='noopener noreferrer'
                            size='small'
                        >
                            <GitHub fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Container>
        </Box>
    )
}

export default Footer
