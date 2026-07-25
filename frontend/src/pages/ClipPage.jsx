import React, { useEffect, useRef, useState } from 'react'
import { deleteClip, listClips, uploadClip } from '../services/videoConfig'
import { Alert, Box, Button, CircularProgress, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { DeleteOutlineRounded, MovieCreationOutlined, UploadFileRounded } from '@mui/icons-material'
import { palette } from '../theme'
import { formatTimecode } from '../utils/formatTimecode'

const ClipPage = () => {
    const [clips, setClips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [title, setTitle] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const fileInputRef = useRef(null)

    const [deletingId, setDeletingId] = useState(null)

    const load = async () => {
        try {
            setLoading(true)
            setError(null)
            setClips(await listClips())
        } catch (error) {
            setError(error.message || 'Could not load clips')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleUpload = async (event) => {
        event.preventDefault()
        if (!title.trim() || !file) return

        try {
            setUploading(true)
            setUploadError(null)
            await uploadClip(title.trim(), file)

            setTitle('')
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''

            await load()
        } catch (error) {
            setUploadError(error.message || 'upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (clipId) => {
        try {
            setDeletingId(clipId)
            await deleteClip(clipId)
            setClips((prev) => prev.filter((clip) => clip.id !== clipId))
        } catch (error) {
            setError(error.message || "could not delet the clip")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Stack spacing={3}>
            <Box
                component="form"
                onSubmit={handleUpload}
                sx={{
                    p: 2.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.03)'
                }}
            >
                <Typography variant='subtitle1' sx={{ fontSize: 13, letterSpacing: '0.05em', color: 'text.secondary', mb: 1.5 }}>
                    Upload Clip
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row', alignItems: { sm: 'center' } }} spacing={1.5} >
                    <TextField
                        label='Title'
                        size='small'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                    <Button
                        component='label'
                        variant='outlined'
                        size='small'
                        startIcon={<UploadFileRounded fontSize='small' />}
                        sx={{ borderColor: 'divider', color: 'text.primary', whiteSpace: 'nowrap' }}
                    >
                        {file ? file.name : 'choose video'}
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='.mp4,.mov,.webm'
                            hidden
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </Button>

                    <Button
                        type='submit'
                        variant='contained'
                        size='small'
                        disabled={!title.trim() || !file || uploading}
                        sx={{ backgroundColor: palette.filmAmber, whiteSpace: 'nowrap' }}
                    >
                        {uploading ? <CircularProgress size={18} sx={{ color: "#0E1013" }} /> : "upload"}
                    </Button>
                </Stack>

                {uploadError && (
                    <Alert severity='error' variant='outlined' sx={{ mt: 1.5 }}>
                        {uploadError}
                    </Alert>
                )}
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
            ) : clips.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'center', py: 4 }}>
                    No clips uploaded yet. Add one above to satrt building sections
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {clips.map((clip) => (
                        <Stack
                            key={clip.id}
                            direction='row'
                            spacing={1.5}
                            sx={{
                                alignItems: 'center',
                                px: 1.5,
                                py: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'rgba(255,255,255,0.03)'
                            }}
                        >
                            <MovieCreationOutlined fontSize='small' sx={{ color: palette.reelTeal }} />

                            <Stack sx={{ flex: 1, minWidth: 0}}>
                                <Typography noWrap sx={{ fontSize: 14}}>
                                    {clip.title}
                                </Typography>
                                <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace' }}>
                                    {clip.filename}
                                </Typography>
                            </Stack>

                            <Typography
                                sx={{
                                    fontFamily: '"IBM Plex Mono", monospace',
                                    fontSize: 12,
                                    color: 'text.secondary',
                                    flexShrink: 0
                                }}
                            >
                                {formatTimecode(clip.duration)}
                            </Typography>

                            <Tooltip title="Delete clip">
                                <span>
                                    <IconButton
                                        size='small'
                                        onClick={() => handleDelete(clip.id)}
                                        disabled={deletingId === clip.id}
                                    >
                                        {deletingId === clip.id ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <DeleteOutlineRounded fontSize='small' />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Stack>
    )
}

export default ClipPage
