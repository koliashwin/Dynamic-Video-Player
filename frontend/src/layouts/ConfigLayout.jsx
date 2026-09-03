import { ArrowBackRounded } from '@mui/icons-material'
import { Box, Button, Container, Icon, IconButton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { Link as RouterLink, Navigate, useLocation, Outlet } from 'react-router-dom'
import { palette } from '../theme'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const TABS = [
    { label: 'Clip Library', path: '/config/clips' },
    { label: 'Sections', path: '/config/sections' },
    { label: 'Flows', path: '/config/flows' },
    { label: 'Public Vault', path: '/config/vault'}
]

const ConfigLayout = () => {
    const location = useLocation()

    if (location.pathname === '/config' || location.pathname === '/config/') {
        return <Navigate to="/config/clips" replace />
    }

    const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path))?.path || false

    return (
        <Container maxWidth='lg' sx={{ py: { xs: 4, sm: 6 } }}>
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Tooltip title="Back to Player">
                        <IconButton component={RouterLink} to="/" size="small">
                            <ArrowBackRounded fontSize='small' />
                        </IconButton>
                    </Tooltip>

                    <SignedIn>
                        <UserButton afterSwitchSessionUrl='/' />
                    </SignedIn>
                </Stack>
                <Stack spacing={0.25}>
                    <Typography variant='h1' sx={{ fontSize: { xs: 20, sm: 24 } }}>
                        Configuration options
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        Manage clips, sections and flows
                    </Typography>
                </Stack>

                {/* frontend auth testing with clerk */}
                <SignedOut>
                    <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
                        <Typography>
                            Sign in to manage clips, sections and flows.
                        </Typography>
                        <SignInButton mode='modal'>
                            <Button variant='contained' sx={{ backgroundColor: palette.filmAmber }}>
                                Sign In
                            </Button>
                        </SignInButton>
                    </Stack>
                </SignedOut>

                <SignedIn>
                    <Box
                        sx={{
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            px: 1
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            TabIndicatorProps={{ style: { backgroundColor: palette.filmAmber } }}
                            sx={{ minHeight: 44 }}
                        >
                            {TABS.map((tab) => (
                                <Tab
                                    key={tab.path}
                                    value={tab.path}
                                    label={tab.label}
                                    component={RouterLink}
                                    to={tab.path}
                                    sx={{
                                        minHeight: 44,
                                        fontFamily: '"Oswald", sans-serif',
                                        letterSpacing: '0.03em',
                                        fontSize: 13,
                                        '&.Mui-selected': { color: palette.filmAmber }
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>

                    <Outlet />
                </SignedIn>
            </Stack>
        </Container>
    )
}

export default ConfigLayout
