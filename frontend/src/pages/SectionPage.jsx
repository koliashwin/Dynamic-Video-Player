import React, { useEffect, useState } from 'react'
import { palette } from '../theme'
import { attachClipToSection, createSection, deleteSection, detachClipFromSection, listClips, listSections } from '../services/videoConfig'
import { Alert, Box, Button, CircularProgress, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { AddLinkRounded, DeleteOutlineRounded } from '@mui/icons-material'
import { formatTimecode } from '../utils/formatTimecode'

const SECTION_TYPES = [
    { value: 'single', label: 'Single - plays clip normally' },
    { value: 'choice', label: 'Choice - viewer can pick a clip to play' },
    { value: 'random', label: 'Random - one clip play at random' }
]

const typeLabel = (type) => {
    if (type === 'choice') return { text: 'BRANCH', color: palette.reelTeal }
    if (type === 'random') return { text: 'RANDOM DRAW', color: 'text.secondary' }
    return { text: 'SINGLE', color: 'text.secondary' }
}

const AttachClipRow = ({ section, clips, onAttached }) => {
    const [clipId, setClipId] = useState('')
    const [attaching, setAttaching] = useState(false)
    const [error, setError] = useState(null)

    const attachedIds = new Set(section.clip_links.map((link) => link.clip.id))
    const availableClips = clips.filter((clip) => !attachedIds.has(clip.id))

    const handleAttach = async () => {
        if (!clipId) return
        try {
            setAttaching(true)
            setError(null)
            await attachClipToSection(section.id, clipId)
            setClipId('')
            await onAttached()
        } catch (error) {
            setError(error.message || 'Could not attached clip')
        } finally {
            setAttaching(false)
        }
    }

    if (availableClips.length === 0) {
        return (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                All clips are already attached to this section
            </Typography>
        )
    }

    return (
        <Stack spacing={0.75}>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                    select
                    size='small'
                    value={clipId}
                    onChange={(e) => setClipId(e.target.value)}
                    label="Add clip"
                    sx={{ minWidth: 220 }}
                >
                    {availableClips.map((clip) => (
                        <MenuItem key={clip.id} value={clip.id}>
                            {clip.title}
                        </MenuItem>
                    ))}
                </TextField>
                <Button
                    size='small'
                    variant='outlined'
                    startIcon={attaching ? <CircularProgress size={14} /> : <AddLinkRounded fontSize='small' />}
                    disabled={!clipId || attaching}
                    onClick={handleAttach}
                    sx={{ borderColor: 'divider', color: 'text.primary' }}
                >
                    Attach
                </Button>
            </Stack>
            {error && (
                <Typography sx={{ fontSize: 11, color: 'error.main' }}>{error}</Typography>
            )}
        </Stack>
    )
}

const SectionPage = () => {
    const [sections, setSections] = useState([])
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [title, setTitle] = useState('')
    const [type, setType] = useState('single')
    const [creating, setCreating] = useState(false)

    const [busyLinkId, setBusyLinkId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            setError(null)
            const [sectionsData, clipsData] = await Promise.all([listSections(), listClips()])
            setSections(sectionsData)
            setClips(clipsData)
        } catch (error) {
            setError(error.message || 'Could not load sections')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleCreate = async (event) => {
        event.preventDefault()
        if (!title.trim()) return

        try {
            setCreating(true)
            setError(null)
            await createSection(title.trim(), type)
            setTitle('')
            setType('single')
            await load()
        } catch (error) {
            setError(error.message || "Could not create section")
        } finally {
            setCreating(false)
        }
    }

    const handleDetach = async (section, linkId) => {
        try {
            setBusyLinkId(linkId)
            await detachClipFromSection(section.id, linkId)
            await load()
        } catch (error) {
            setError(error.message || 'could not detach clip')
        } finally {
            setBusyLinkId(null)
        }
    }

    const handleDeleteSection = async (sectionId) => {
        try {
            setDeletingId(sectionId)
            await deleteSection(sectionId)
            setSections((prev) => prev.filter((section) => section.id !== sectionId))
        } catch (error) {
            setError(error.message || 'Could not delete section')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Stack spacing={3}>
            <Box
                component='form'
                onSubmit={handleCreate}
                sx={{
                    p: 2.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                }}
            >
                <Typography variant='subtitle1' sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'text.secondary', mb: 1.5 }}>
                    New Section
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                        label='Title'
                        size='small'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                        select
                        label='type'
                        size='small'
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        sx={{ minWidth: 260 }}
                    >
                        {SECTION_TYPES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        type='submit'
                        variant='contained'
                        size='small'
                        disabled={!title.trim() || creating}
                        sx={{ backgroundColor: palette.filmAmber, whiteSpace: 'nowrap' }}
                    >
                        {creating ? <CircularProgress size={18} sx={{ color: '#0E1013' }} /> : 'Create section'}
                    </Button>
                </Stack>
            </Box>

            {error && (
                <Alert severity='error' variant='outlined'>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack sx={{ py: 6, alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ color: palette.filmAmber }} />
                </Stack>
            ) : sections.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'center', py: 4 }}>
                    No sections yet. Create one above, then attach clips in it
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {sections.map((section) => {
                        const label = typeLabel(section.type)
                        return (
                            <Box
                                key={section.id}
                                sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'rgba(255,255,255,0.03)'
                                }}
                            >
                                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Stack spacing={0.25}>
                                        <Typography variant='subtitle1' sx={{ fontSize: 15, textTransform: 'uppercase' }}>
                                            {section.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: label.color }}>
                                            {label.text}
                                        </Typography>
                                    </Stack>

                                    <Tooltip title="Delet section">
                                        <span>
                                            <IconButton
                                                size='small'
                                                onClick={() => handleDeleteSection(section.id)}
                                                disabled={deletingId === section.id}
                                            >
                                                {deletingId === section.id ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    <DeleteOutlineRounded fontSize='small' />
                                                )}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>

                                <Stack spacing={0.75} sx={{ mt: 1.5, mb: 1.5 }}>
                                    {section.clip_links.length === 0 ? (
                                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                            No clips attached yet
                                        </Typography>
                                    ) : (
                                        section.clip_links.map((link) => (
                                            <Stack
                                                key={link.id}
                                                direction='row'
                                                spacing={1.5}
                                                sx={{
                                                    alignItems: 'center',
                                                    px: 1.25,
                                                    py: 0.75,
                                                    borderRadius: 1,
                                                    backgroundColor: 'rgba(255,255,255,0.04)'
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontFamily: '"IBM Plex Mono", monospace',
                                                        fontSize: 11,
                                                        color: 'text.secondary',
                                                        width: 24
                                                    }}
                                                >
                                                    {String(link.order_index).padStart(2, '0')}
                                                </Typography>
                                                <Typography sx={{ fontSize: 13, flex: 1 }} noWrap>
                                                    {link.clip.title}
                                                </Typography>
                                                <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: 'text.secondary' }}>
                                                    {formatTimecode(link.clip.duration)}
                                                </Typography>
                                                <Tooltip title='Detach clip'>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDetach(section, link.id)}
                                                            disabled={busyLinkId === link.id}
                                                        >
                                                            {busyLinkId === link.id ? (
                                                                <CircularProgress size={14} />
                                                            ) : (
                                                                <DeleteOutlineRounded sx={{ fontSize: 16 }} />
                                                            )}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        ))
                                    )}
                                </Stack>

                                <AttachClipRow section={section} clips={clips} onAttached={load} />
                            </Box>
                        )
                    })}
                </Stack>
            )}
        </Stack>
    )
}

export default SectionPage
