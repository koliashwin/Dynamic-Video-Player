import React, { useEffect, useState } from 'react'
import { listFlows, listPublishedFlows } from '../services/videoConfig'
import { Alert, Box, Button, CircularProgress, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { ArrowBackRounded, PlayArrowRounded, TuneRounded } from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { palette } from '../theme'
import { formatTimecode } from '../utils/formatTimecode'

const typeLabel = (type) => {
    if (type === 'choice') return { text: 'BRANCH', color: palette.reelTeal }
    if (type === 'random') return { text: 'RANDOM DRAW', color: 'text.secondary' }
    return { text: 'SINGLE', color: 'text.secondary' }
}

// estimated time only: real time spend on a flow will very based on viewers choices
const estimateFlowDuration = (flow) => {
    return flow.section_links.reduce((total, link) => {
        const durations = link.section.clip_links.map((clipLink) => clipLink.clip.duration)
        if (durations.length === 0) return total

        if (link.section.type === 'single') {
            return total + durations.reduce((sum, d) => sum + d, 0)
        }
        if (link.section.type === 'random') {
            return total + durations.reduce((sum, d) => sum + d, 0) / durations.length
        }
        // if choice then consider maxmum duration
        return total + Math.max(...durations)
    }, 0)
}

const FeedPage = () => {
    const [flows, setFlows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            setError(null)
            setFlows(await listPublishedFlows())
        } catch (error) {
            setError(error.message || 'Could not log flows')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <Container maxWidth='lg' sx={{ py: { xs: 4, sm: 6 } }}>
            <Stack spacing={3}>
                <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Tooltip title="Video Player">
                        <IconButton component={RouterLink} to='/flow' size='small'>
                            <ArrowBackRounded fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <Stack spacing={0.25} sx={{ flex: 1 }}>
                        <Typography variant='h1' sx={{ fontSize: { xs: 20, sm: 24 } }}>
                            Flow Feed
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                            pick a flow to play
                        </Typography>
                    </Stack>
                    <Tooltip title="Congiguration panel">
                        <IconButton component={RouterLink} to='/config/clips' size='small'>
                            <TuneRounded fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {error && (
                    <Alert severity='error' variant='outlined'>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Stack sx={{ alignItems: 'center' }}>
                        <CircularProgress size={24} sx={{ color: palette.filmAmber }} />
                    </Stack>
                ) : flows.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'center', py: 4 }}>
                        No flows yet. Head to the configuration panel to build one
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 2
                        }}
                    >
                        {flows.map((flow) => {
                            const duration = estimateFlowDuration(flow)
                            const hasBranch = flow.section_links.some((link) => link.section.type === 'choice')
                            const emptySections = flow.section_links.filter((link) => link.section.clip_links.length === 0)
                            const isEmpty = flow.section_links.length === 0 || emptySections.length > 0
                            const disabledReason = flow.section_links.length === 0
                                ? "This flow has no sections yet"
                                : emptySections.length > 0
                                    ? `${emptySections.length} section${emptySections.length === 1 ? '' : 's'} still need clips: ${emptySections.map((link) => link.section.title).join(', ')}`
                                    : null

                            return (
                                <Stack
                                    key={flow.id}
                                    spacing={1.5}
                                    sx={{
                                        p: 2,
                                        borderRadius: 1.5,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        transition: 'all 160ms ease',
                                        '&:hover': {
                                            borderColor: palette.filmAmber,
                                            backgroundColor: 'rgba(227, 166, 74, 0.06)'
                                        }
                                    }}
                                >
                                    <Stack spacing={0.25}>
                                        <Typography variant='subtitle1' sx={{ fontSize: 15, textTransform: 'uppercase' }}>
                                            {flow.name}
                                        </Typography>
                                        {flow.description && (
                                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                                                {flow.description}
                                            </Typography>
                                        )}
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={0.75}
                                        sx={{ flexWrap: 'wrap', rowGap: 0.75 }}
                                    >
                                        {flow.section_links.map((link) => {
                                            const label = typeLabel(link.section.type)
                                            return (
                                                <Box
                                                    key={link.id}
                                                    sx={{
                                                        px: 0.9,
                                                        py: 0.35,
                                                        borderRadius: 999,
                                                        border: '1px solid',
                                                        borderColor: 'divider'
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontFamily: '"IBM Plex Mono", monospace',
                                                            fontSize: 10,
                                                            color: label.color
                                                        }}
                                                    >
                                                        {link.section.title}
                                                    </Typography>
                                                </Box>
                                            )
                                        })}
                                    </Stack>

                                    <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                        <Stack spacing={0.1}>
                                            <Typography
                                                sx={{
                                                    fontFamily: '"IBM Plex Mono", monospace',
                                                    fontSize: 12,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                ~{formatTimecode(duration)} . {flow.section_links.length} section{flow.section_links.length === 1 ? '' : 's'}
                                            </Typography>
                                            {hasBranch && (
                                                <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: palette.reelTeal }}>
                                                    HAS BRANCHES
                                                </Typography>
                                            )}
                                        </Stack>

                                        <Tooltip title={disabledReason || ''} disableHoverListener={!isEmpty}>
                                            <span>
                                                <Button
                                                    component={RouterLink}
                                                    to={`/flow/${flow.id}`}
                                                    size='small'
                                                    variant='contained'
                                                    disabled={isEmpty}
                                                    startIcon={<PlayArrowRounded fontSize='small' />}
                                                    sx={{ backgroundColor: palette.filmAmber, whiteSpace: 'nowrap' }}
                                                >
                                                    Play
                                                </Button>
                                            </span>
                                        </Tooltip>

                                    </Stack>
                                </Stack>
                            )
                        })}
                    </Box>
                )}

            </Stack>
        </Container>
    )
}

export default FeedPage
