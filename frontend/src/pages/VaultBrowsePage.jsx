import React, { useEffect, useState } from 'react'
import { listPublicClips, listPublicSections, listSections, listFlows, attachClipToSection, attachSectionToFlow } from '../services/videoConfig'
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { AddLinkRounded, MovieCreationOutlined } from '@mui/icons-material'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { palette } from '../theme'
import { formatTimecode } from '../utils/formatTimecode'

const typeLabel = (type) => {
    if (type === 'choice') return { text: 'BRANCH', color: palette.reelTeal }
    if (type === 'random') return { text: 'RANDOM DRAW', color: 'text.secondary' }
    return { text: 'SINGLE', color: 'text.secondary' }
}

const AttachClipToSectionRow = ({ clip, mySections, onAttached }) => {
    const [sectionId, setSectionId] = useState('')
    const [attaching, setAttaching] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(false)

    const availableSections = mySections.filter(
        (section) => !section.clip_links.some((link) => link.clip.id === clip.id)
    )

    const handleAttach = async () => {
        if (!sectionId) return
        try {
            setAttaching(true)
            setError(null)
            await attachClipToSection(sectionId, clip.id)
            setDone(true)
            onAttached()
        } catch (error) {
            setError(error.message || 'Could not attach clip')
        } finally {
            setAttaching(false)
        }
    }

    if (availableSections.length === 0) {
        return (
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                {mySections.length === 0 ? 'Create a section first' : 'Already in all your sections'}
            </Typography>
        )
    }

    return (
        <Stack spacing={0.5}>
            <Stack direction='row' spacing={0.75}>
                <TextField
                    select
                    size='small'
                    value={sectionId}
                    onChange={(e) => { setSectionId(e.target.value); setDone(false) }}
                    label='Add to section'
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    {availableSections.map((section) => (
                        <MenuItem key={section.id} value={section.id}>{section.title}</MenuItem>
                    ))}
                </TextField>
                <Button
                    size='small'
                    variant='outlined'
                    startIcon={attaching ? <CircularProgress size={14} /> : <AddLinkRounded fontSize='small' />}
                    disabled={!sectionId || attaching}
                    onClick={handleAttach}
                    sx={{ borderColor: 'divider', color: 'text.primary', whiteSpace: 'nowrap' }}
                >
                    Attach
                </Button>
            </Stack>
            {done && <Typography sx={{ fontSize: 10.5, color: palette.filmAmber }}>Attached</Typography>}
            {error && <Typography sx={{ fontSize: 10.5, color: 'error.main' }}>{error}</Typography>}
        </Stack>
    )
}

const AttachSectionToFlowRow = ({ section, myFlows, onAttached }) => {
    const [flowId, setFlowId] = useState('')
    const [attaching, setAttaching] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(false)

    const availableFlows = myFlows.filter(
        (flow) => !flow.section_links.some((link) => link.section.id === section.id)
    )

    const handleAttach = async () => {
        if (!flowId) return
        try {
            setAttaching(true)
            setError(null)
            await attachSectionToFlow(flowId, section.id)
            setDone(true)
            onAttached()
        } catch (error) {
            setError(error.message || 'Could not attach section')
        } finally {
            setAttaching(false)
        }
    }

    if (availableFlows.length === 0) {
        return (
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                {myFlows.length === 0 ? 'Create a flow first' : 'Already in all your flows'}
            </Typography>
        )
    }

    return (
        <Stack spacing={0.5} sx={{ minWidth: 220 }}>
            <Stack direction='row' spacing={0.75}>
                <TextField
                    select
                    size='small'
                    value={flowId}
                    onChange={(e) => { setFlowId(e.target.value); setDone(false) }}
                    label='Add to flow'
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    {availableFlows.map((flow) => (
                        <MenuItem key={flow.id} value={flow.id}>{flow.name}</MenuItem>
                    ))}
                </TextField>
                <Button
                    size='small'
                    variant='outlined'
                    startIcon={attaching ? <CircularProgress size={14} /> : <AddLinkRounded fontSize='small' />}
                    disabled={!flowId || attaching}
                    onClick={handleAttach}
                    sx={{ borderColor: 'divider', color: 'text.primary', whiteSpace: 'nowrap' }}
                >
                    Attach
                </Button>
            </Stack>
            {done && <Typography sx={{ fontSize: 10.5, color: palette.filmAmber }}>Attached</Typography>}
            {error && <Typography sx={{ fontSize: 10.5, color: 'error.main' }}>{error}</Typography>}
        </Stack>
    )
}

const VaultBrowsePage = () => {
    const [clips, setClips] = useState([])
    const [sections, setSections] = useState([])
    const [mySections, setMySections] = useState([])
    const [myFlows, setMyFlows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadPublic = async () => {
        const [clipsData, sectionsData] = await Promise.all([listPublicClips(), listPublicSections()])
        setClips(clipsData)
        setSections(sectionsData)
    }

    const loadOwn = async () => {
        try {
            const [sectionsData, flowsData] = await Promise.all([listSections(), listFlows()])
            setMySections(sectionsData)
            setMyFlows(flowsData)
        } catch {
            // signed out or otherwise unavailable -- attach UI just won't show pickers
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                await Promise.all([loadPublic(), loadOwn()])
            } catch (error) {
                setError(error.message || 'Could not load the public vault')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <Stack sx={{ py: 6, alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ color: palette.filmAmber }} />
            </Stack>
        )
    }

    if (error) {
        return <Alert severity='error' variant='outlined'>{error}</Alert>
    }

    return (
        <Stack spacing={4}>
            <SignedOut>
                <Alert severity='info' variant='outlined'>
                    Sign in to attach public clips or sections into your own work.
                </Alert>
            </SignedOut>

            <Stack spacing={1.5}>
                <Typography variant='subtitle1' sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'text.secondary' }}>
                    Public Clips
                </Typography>

                {clips.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        No public clips yet. Make one of yours public from the Clip Library.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
                        {clips.map((clip) => (
                            <Box
                                key={clip.id}
                                sx={{
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 96,
                                        background: 'linear-gradient(135deg, #1B1D21 0%, #24272c 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <MovieCreationOutlined sx={{ fontSize: 30, color: palette.reelTeal, opacity: 0.5 }} />
                                    <Box sx={{ position: 'absolute', right: 6, bottom: 6, px: 0.6, py: 0.15, borderRadius: 0.5, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                                        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: '#fff' }}>
                                            {formatTimecode(clip.duration)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1.25 }}>
                                    <Typography noWrap sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>
                                        {clip.title}
                                    </Typography>
                                    <SignedIn>
                                        <AttachClipToSectionRow clip={clip} mySections={mySections} onAttached={loadOwn} />
                                    </SignedIn>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant='subtitle1' sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'text.secondary' }}>
                    Public Sections
                </Typography>

                {sections.length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        No public sections yet.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {sections.map((section) => {
                            const label = typeLabel(section.type)
                            return (
                                <Stack
                                    key={section.id}
                                    direction='row'
                                    spacing={1.5}
                                    sx={{
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        rowGap: 1,
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        backgroundColor: 'rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13, flex: 1, minWidth: 120, textTransform: 'uppercase' }}>
                                        {section.title}
                                    </Typography>
                                    <Chip
                                        label={label.text}
                                        size='small'
                                        sx={{ height: 18, fontSize: 10, fontWeight: 600, color: label.color, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid', borderColor: label.color }}
                                    />
                                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                                        {section.clip_links.length} clip{section.clip_links.length === 1 ? '' : 's'}
                                    </Typography>
                                    <SignedIn>
                                        <AttachSectionToFlowRow section={section} myFlows={myFlows} onAttached={loadOwn} />
                                    </SignedIn>
                                </Stack>
                            )
                        })}
                    </Stack>
                )}
            </Stack>
        </Stack>
    )
}

export default VaultBrowsePage