import React, { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { attachSectionToFlow, createFlow, deleteFlow, detachSectionFromFlow, listFlows, listSections, publishFlow, unpublishFlow } from '../services/videoConfig'
import { Alert, Box, Button, Chip, CircularProgress, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { AddLinkRounded, DeleteOutlineRounded, OpenInNewRounded, PlayCircleOutlineRounded, PublicOffRounded, PublicRounded, VisibilityOffRounded, VisibilityRounded } from '@mui/icons-material'
import { palette } from '../theme'
import InlineFlowPreview from '../components/InlineFlowPreview'

const typeLabel = (type) => {
    if (type === 'choice') return { text: 'BRANCH', color: palette.reelTeal }
    if (type === 'random') return { text: 'RANDOM DRAW', color: 'text.secondary' }
    return { text: 'SINGLE', color: 'text.secondary' }
}

const AttachSectionRow = ({ flow, sections, onAttached }) => {
    const [sectionId, setSectionId] = useState('')
    const [attaching, setAttaching] = useState(false)
    const [error, setError] = useState(null)

    const attachedIds = new Set(flow.section_links.map((link) => link.section.id))
    const availableSections = sections.filter((section) => !attachedIds.has(section.id))

    const handleAttach = async () => {
        if (!sectionId) return
        try {
            setAttaching(true)
            setError(null)
            await attachSectionToFlow(flow.id, sectionId)
            setSectionId('')
            await onAttached()
        } catch (error) {
            setError(error.message || "Could not attach section")
        } finally {
            setAttaching(false)
        }
    }

    if (availableSections.length === 0) {
        return (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                All sections are already part of this flow.
            </Typography>
        )
    }

    return (
        <Stack spacing={0.75}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                    select
                    size="small"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    label="Add section"
                    sx={{ minWidth: 220 }}
                >
                    {availableSections.map((section) => {
                        const isSectionEmpty = section.clip_links.length === 0
                        return (
                            <MenuItem key={section.id} value={section.id} disabled={isSectionEmpty}>
                                {section.title}{isSectionEmpty ? " (no clips yet)" : ""}
                            </MenuItem>
                        )
                    })}
                </TextField>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={attaching ? <CircularProgress size={14} /> : <AddLinkRounded fontSize="small" />}
                    disabled={!sectionId || attaching}
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

const FlowPage = () => {
    const [flows, setFlows] = useState([])
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)

    const [busyLinkId, setBusyLinkId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [publishingId, setPublishingId] = useState(null)
    const [expandedPreviewId, setExpandedPreviewId] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            setError(null)
            const [flowsData, sectionData] = await Promise.all([listFlows(), listSections()])
            setFlows(flowsData)
            setSections(sectionData)
        } catch (error) {
            setError(error.message || 'Could not load flows')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleCreate = async (event) => {
        event.preventDefault()
        if (!name.trim()) return

        try {
            setCreating(true)
            setError(null)
            await createFlow(name.trim(), description.trim())
            setName('')
            setDescription('')
            await load()
        } catch (error) {
            setError(error.message || 'Could not create a flow')
        } finally {
            setCreating(false)
        }
    }

    const handleDetach = async (flow, linkId) => {
        try {
            setBusyLinkId(linkId)
            await detachSectionFromFlow(flow.id, linkId)
            await load()
        } catch (error) {
            if (error.status === 409) {
                const confirmed = window.confirm(`${error.message}\n\nRemove anyway?`)
                if (confirmed) {
                    try {
                        await detachSectionFromFlow(flow.id, linkId, true)
                        await load()
                    } catch (retryError) {
                        setError(retryError.message || "could not detach section")
                    }
                }
            } else {
                setError(error.message || 'could not detach section')
            }
        } finally {
            setBusyLinkId(null)
        }
    }

    const handleDeleteFlow = async (flowId) => {
        try {
            setDeletingId(flowId)
            await deleteFlow(flowId)
            setFlows((prev) => prev.filter((flow) => flow.id !== flowId))
        } catch (error) {
            setError(error.message || 'Could not delete flow')
        } finally {
            setDeletingId(null)
        }
    }

    const handleTogglePublish = async (flow) => {
        try {
            setPublishingId(flow.id)
            setError(null)
            if (flow.is_published) {
                await unpublishFlow(flow.id)
            } else {
                await publishFlow(flow.id)
            }
            await load()
        } catch (error) {
            setError(error.message || 'Could not update publish status')
        } finally {
            setPublishingId(null)
        }
    }

    return (
        <Stack spacing={3}>
            <Box
                component="form"
                onSubmit={handleCreate}
                sx={{
                    p: 2.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                }}
            >
                <Typography variant="subtitle1" sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'text.secondary', mb: 1.5 }}>
                    New Flow
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                        label="Name"
                        size="small"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                        label="Description (optional)"
                        size="small"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={!name.trim() || creating}
                        sx={{ backgroundColor: palette.filmAmber, whiteSpace: 'nowrap' }}
                    >
                        {creating ? <CircularProgress size={18} sx={{ color: '#0E1013' }} /> : 'Create flow'}
                    </Button>
                </Stack>
            </Box>

            {error && (
                <Alert severity="error" variant="outlined">
                    {error}
                </Alert>
            )}

            {loading ? (
                <Stack sx={{ py: 6, alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ color: palette.filmAmber }} />
                </Stack>
            ) : flows.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'center', py: 4 }}>
                    No flows yet. Create one above, then attach sections in playback order.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {flows.map((flow) => (
                        <Box
                            key={flow.id}
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'rgba(255,255,255,0.03)'
                            }}
                        >
                            <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                                <Stack spacing={0.25}>
                                    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                                        <Typography variant="subtitle1" sx={{ fontSize: 15, textTransform: 'uppercase' }}>
                                            {flow.name}
                                        </Typography>
                                        <Chip
                                            label={flow.is_published ? 'PUBLISHED' : 'DRAFT'}
                                            size='small'
                                            sx={{
                                                height: 18,
                                                fontSize: 10,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                color: flow.is_published ? palette.filmAmber : 'text.secondary',
                                                backgroundColor: flow.is_published ? 'rgba(277,166,74, 0.15)' : 'rgba(255, 255, 255, 255, 0.08)',
                                                border: '1px solid',
                                                borderColor: flow.is_published ? palette.filmAmber : 'divider'
                                            }}
                                        />
                                    </Stack>
                                    {flow.description && (
                                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                            {flow.description}
                                        </Typography>
                                    )}
                                </Stack>

                                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center'}}>
                                    <Tooltip title={expandedPreviewId === flow.id ? 'Close preview' : 'Preview inline'}>
                                        <IconButton
                                            size='small'
                                            onClick={() => setExpandedPreviewId((prev) => prev === flow.id ? null : flow.id)}
                                            sx={expandedPreviewId === flow.id ? {color: palette.filmAmber} : undefined}
                                        >
                                            {expandedPreviewId === flow.id ? (
                                                <VisibilityOffRounded fontSize='small' />
                                            ) : (
                                                <VisibilityRounded fontSize='small' />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Open full palyer in new context">
                                        <IconButton
                                            component={RouterLink}
                                            to={`/flow/${flow.id}`}
                                            size='small'
                                        >
                                            <OpenInNewRounded fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={flow.is_published ? 'Unpublish (hide from feed)' : 'Publish (show in feed)'}>
                                        <span>
                                            <IconButton
                                                size='small'
                                                onClick={() => handleTogglePublish(flow)}
                                                disabled={publishingId === flow.id}
                                            >
                                                {publishingId === flow.id ? (
                                                    <CircularProgress size={16} />
                                                ) : flow.is_published ? (
                                                    <PublicRounded fontSize='small' sx={{color: palette.filmAmber}} />
                                                ) : (
                                                    <PublicOffRounded fontSize='small' />
                                                )}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Delete flow">
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteFlow(flow.id)}
                                                disabled={deletingId === flow.id}
                                            >
                                                {deletingId === flow.id ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    <DeleteOutlineRounded fontSize="small" />
                                                )}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>
                            </Stack>

                            <Stack spacing={0.75} sx={{ mt: 1.5, mb: 1.5 }}>
                                {flow.section_links.length === 0 ? (
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                        No sections attached yet.
                                    </Typography>
                                ) : (
                                    flow.section_links.map((link) => {
                                        const label = typeLabel(link.section.type)
                                        return (
                                            <Stack
                                                key={link.id}
                                                direction="row"
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
                                                    {link.section.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: label.color }}>
                                                    {label.text}
                                                </Typography>
                                                <Tooltip title="Detach section">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDetach(flow, link.id)}
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
                                        )
                                    })
                                )}
                            </Stack>

                            <AttachSectionRow flow={flow} sections={sections} onAttached={load} />

                            {expandedPreviewId === flow.id && (
                                <InlineFlowPreview flowId={flow.id} />
                            )}
                        </Box>
                    ))}
                </Stack>
            )}
        </Stack>
    )
}

export default FlowPage
