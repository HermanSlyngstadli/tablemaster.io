import React from 'react'
import styled from 'styled-components'

interface OverlayProps {
    open: boolean
}

const Overlay = styled.div<OverlayProps>`
    display: ${(props) => (props.open ? 'flex' : 'none')};
    align-items: center;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 10;
    background: rgba(14, 14, 14, 0.8);
`

const ModalContainer = styled.div`
    z-index: 20;
    max-width: 800px;
    background: var(--light-color);
    padding: 3rem;
    overflow-y: auto;
    margin-top: 4em;
    border-radius: 1rem;
    display: flex;
    flex-direction: row;
    gap: 3rem;

    @media only screen and (max-width: 850px) {
        margin-top: 2em;
        margin-left: 1em;
        margin-right: 1em;
        max-height: 85vh;
        flex-direction: column;
    }
`

interface ModalProps {
    children: React.ReactNode
    open: boolean
    onDismiss: () => void
}

function Modal({ children, open, onDismiss }: ModalProps) {
    return (
        <Overlay open={open} onClick={onDismiss}>
            <ModalContainer
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                {children}
            </ModalContainer>
        </Overlay>
    )
}

export default Modal
