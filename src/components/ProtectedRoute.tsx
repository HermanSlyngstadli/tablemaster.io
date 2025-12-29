import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageContainer } from './PageContainer'
import { Heading2, Paragraph } from './Typography'

interface ProtectedRouteProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, loading, isAdmin } = useAuth()

    if (loading) {
        return (
            <PageContainer>
                <Heading2>Loading...</Heading2>
            </PageContainer>
        )
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    if (requireAdmin && !isAdmin) {
        return (
            <PageContainer>
                <Heading2 style={{ color: 'red' }}>Access Denied</Heading2>
                <Paragraph>You need admin privileges to access this page.</Paragraph>
            </PageContainer>
        )
    }

    return <>{children}</>
}
