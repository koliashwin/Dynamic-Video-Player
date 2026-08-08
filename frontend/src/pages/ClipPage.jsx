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
            if (error.status === 409) {
                const confirmed = window.confirm(`${error.message}\n\nDelete anyway?`)
                if (confirmed) {
                    try {
                        await deleteClip(clipId, true)
                        setClips((prev) => prev.filter((clip) => clip.id !== clipId))
                    } catch (retryError) {
                        setError(retryError.message || "could not delete the clip")
                    }
                }
            } else {
                setError(error.message || "could not delet the clip")
            }
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
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 2
                    }}
                >
                    {clips.map((clip) => (
                        <Box
                            key={clip.id}
                            sx={{
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                overflow: 'hidden',
                                transition: 'border-color 160ms ease, transform 160ms ease',
                                '&:hover': {
                                    borderColor: palette.filmAmber,
                                    transform: 'translateY(-2px)'
                                },
                                '&:hover .clip-card-delete': {
                                    opacity: 1
                                }
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
                                
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 6,
                                        bottom: 6,
                                        px: 0.6,
                                        py: 0.15,
                                        borderRadius: 0.5,
                                        backgroundColor: 'rgba(0,0,0,0.7)'
                                    }}
                                >
                                    <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: '#fff', lineHeight: 1.4}}>
                                        {formatTimecode(clip.duration)}
                                    </Typography>
                                </Box>

                                <Box
                                    className='clip-card-delete'
                                    sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        opacity: 0,
                                        transition: "opacity 160ms ease"
                                    }}
                                >
                                    <Tooltip title="Delete Clip">
                                        <span>
                                            <IconButton
                                                size='small'
                                                onClick={() => handleDelete(clip.id)}
                                                disabled={deletingId === clip.id}
                                                sx={{
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'}
                                                }}
                                            >
                                                {deletingId === clip.id ? (
                                                    <CircularProgress size={14} sx={{ color: '#fff'}} />
                                                ) : (
                                                    <DeleteOutlineRounded fontSize='small' sx={{ color: '#fff'}} />
                                                )}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Box sx={{p: 1.25}}>
                                <Typography noWrap sx={{ fontSize: 13, fontWeight: 500}}>
                                    {clip.title}
                                </Typography>
                                <Typography noWrap sx={{ fontSize: 10.5, color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace'}}>
                                    {clip.filename}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Stack>
    )
}

export default ClipPage
