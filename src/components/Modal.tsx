import React from 'react'
import { Dialog } from '@digdir/designsystemet-react'

interface ModalProps {
    children: React.ReactNode
    open: boolean
    onDismiss: () => void
}

function Modal({ children, open, onDismiss }: ModalProps) {
    return (
        <Dialog open={open} onClose={onDismiss}>
            {children}
        </Dialog>
    )
}

export default Modal
