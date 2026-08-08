import React, { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { attachSectionToFlow, createFlow, deleteFlow, detachSectionFromFlow, listFlows, listSections, publishFlow, unpublishFlow } from '../services/videoConfig'
import { Alert, Box, Button, Chip, CircularProgress, Collapse, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { AddLinkRounded, CloseRounded, DeleteOutlineRounded, ExpandLessRounded, ExpandMoreRounded, LinkRounded, OpenInNewRounded, PlayCircleOutlineRounded, PublicOffRounded, PublicRounded, VisibilityOffRounded, VisibilityRounded } from '@mui/icons-material'
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
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

const FlowCard = ({
    flow,
    sections,
    compact,
    isActive,
    sectionsExpanded,
    onToggleSections,
    onPreview,
    onTogglePublish,
    publishingId,
    onDelete,
    deletingId,
    onAttached,
    onDetach,
    busyLinkId

}) => (
    <Box
        sx={{
            p: compact ? 1.5 : 2,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: isActive ? palette.filmAmber : 'divider',
            backgroundColor: isActive ? 'rgba(225, 166, 74, 0.05)' : 'rgba(255,255,255,0.03)',
            transition: 'border-color 160ms ease, background-color 160ms ease, padding 220ms ease'
        }}
    >
        <Stack direction='row' sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={1}>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Stack direction='row' spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography
                        variant='subtitle1'
                        noWrap
                        sx={{ fontSize: compact ? 13.5 : 15, textTransform: 'uppercase' }}
                    >
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
                            backgroundColor: flow.is_published ? 'rgba(227,166,74, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid',
                            borderColor: flow.is_published ? palette.filmAmber : 'divider'
                        }}
                    />
                </Stack>
                {!compact && flow.description && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {flow.description}
                    </Typography>
                )}
            </Stack>

            <Tooltip title='Delete Flow'>
                <span>
                    <IconButton size='small' onClick={onDelete} disabled={deletingId === flow.id}>
                        {deletingId === flow.id ? <CircularProgress size={14} /> : <DeleteOutlineRounded sx={{ fontSize: 18 }} />}
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
                size='small'
                variant={isActive ? 'contained' : 'outlined'}
                startIcon={<PlayCircleOutlineRounded fontSize='small' />}
                onClick={onPreview}
                sx={
                    isActive
                        ? { backgroundColor: palette.filmAmber, color: '#0E1013', '&:hover': { backgroundColor: palette.filmAmber } }
                        : { borderColor: palette.filmAmber, color: palette.filmAmber }
                }
            >
                {isActive ? 'Previewing' : 'Preview'}
            </Button>

            <Button
                size='small'
                variant='outlined'
                startIcon={
                    publishingId === flow.id ? (
                        <CircularProgress size={14} />
                    ) : flow.is_published ? (
                        <PublicRounded fontSize='small' />
                    ) : (
                        <PublicOffRounded fontSize='small' />
                    )
                }
                onClick={onTogglePublish}
                disabled={publishingId === flow.id}
                sx={{ borderColor: 'divider', color: 'text.primary' }}
            >
                {flow.is_published ? "Unpublish" : 'Publish'}
            </Button>

            <Button
                size="small"
                variant="text"
                startIcon={<LinkRounded fontSize="small" />}
                endIcon={sectionsExpanded ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
                onClick={onToggleSections}
                sx={{ color: 'text.secondary' }}
            >
                Sections ({flow.section_links.length})
            </Button>

            <Tooltip title="Open full player in a new context">
                <IconButton component={RouterLink} to={`/flow/${flow.id}`} size="small" sx={{ ml: 'auto' }}>
                    <OpenInNewRounded fontSize="small" />
                </IconButton>
            </Tooltip>
        </Stack>

        <Collapse in={sectionsExpanded} timeout={200}>
            <Stack spacing={0.75} sx={{ mt: 1.5 }}>
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
                                spacing={1.25}
                                sx={{
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.75,
                                    borderRadius: 1,
                                    backgroundColor: 'rgba(255,255,255,0.04)'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        flexShrink: 0,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(255,255,255,0.08)'
                                    }}
                                >
                                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'text.secondary' }}>
                                        {link.order_index}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, flex: 1 }} noWrap>
                                    {link.section.title}
                                </Typography>
                                <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: label.color }}>
                                    {label.text}
                                </Typography>
                                <Tooltip title="Detach Section">
                                    <span>
                                        <IconButton
                                            size='small'
                                            onClick={() => onDetach(flow, link.id)}
                                            disabled={busyLinkId === link.id}
                                        >
                                            {busyLinkId === link.id ? <CircularProgress size={14} /> : <DeleteOutlineRounded sx={{ fontSize: 16 }} />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        )
                    })
                )}

                <AttachSectionRow flow={flow} sections={sections} onAttached={onAttached} />
            </Stack>
        </Collapse>
    </Box>
)

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

    const [activeFlowId, setActiveFlowId] = useState(null)
    const [panelEntered, setPanelEntered] = useState(false)
    const [expandedSectionsId, setExpandedSectionsId] = useState(null)

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

    useEffect(() => {
        if (!activeFlowId) {
            setPanelEntered(false)
            return
        }
        const timer = setTimeout(() => setPanelEntered(true), 20)
        return () => clearTimeout(timer)
    }, [activeFlowId])

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
            if (activeFlowId === flowId) setActiveFlowId(null)
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

    const activeFlow = flows.find((flow) => flow.id === activeFlowId) || null

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
                <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: 'flex-start' }}>
                    <Box
                        sx={{
                            width: '100%',
                            flex: activeFlowId ? { xs: '1 1 100%', md: '0 0 34%' } : '1 1 100%',
                            minWidth: 0,
                            transition: 'flex-basis 320ms cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <Stack spacing={1.25}>
                            {flows.map((flow) => (
                                <FlowCard
                                    key={flow.id}
                                    flow={flow}
                                    sections={sections}
                                    compact={!!activeFlowId}
                                    isActive={activeFlowId === flow.id}
                                    sectionsExpanded={expandedSectionsId === flow.id}
                                    onToggleSections={() =>
                                        setExpandedSectionsId((prev) => (prev === flow.id ? null : flow.id))
                                    }
                                    onPreview={() => setActiveFlowId((prev) => (prev === flow.id ? null : flow.id))}
                                    onTogglePublish={() => handleTogglePublish(flow)}
                                    publishingId={publishingId}
                                    onDelete={() => handleDeleteFlow(flow.id)}
                                    deletingId={deletingId}
                                    onAttached={load}
                                    onDetach={handleDetach}
                                    busyLinkId={busyLinkId}
                                />
                            ))}
                        </Stack>
                    </Box>

                    {activeFlowId && (
                        <Box
                            sx={{
                                flex: { xs: '1 1 100%', md: '1 1 66%' },
                                width: '100%',
                                minWidth: 0,
                                position: { md: 'sticky' },
                                top: { md: 16 },
                                p: 2,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: palette.filmAmber,
                                backgroundColor: 'rgba(227, 166, 74, 0.04)',
                                opacity: panelEntered ? 1 : 0,
                                transform: panelEntered ? 'translateX(0)' : 'translateX(24px)',
                                transition: 'opacity 300ms ease, transform 300ms ease'
                            }}
                        >
                            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontSize: 13, letterSpacing: '0.08em', color: palette.filmAmber, textTransform: 'uppercase' }}
                                >
                                    Previewing — {activeFlow?.name}
                                </Typography>
                                <Tooltip title="Close preview">
                                    <IconButton size="small" onClick={() => setActiveFlowId(null)}>
                                        <CloseRounded fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>

                            <InlineFlowPreview flowId={activeFlowId} />
                        </Box>
                    )}
                </Stack>
            )}
        </Stack>
    )
}

export default FlowPage