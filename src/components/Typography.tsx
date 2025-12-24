// Re-export Designsystemet components for backward compatibility
export { Heading } from '@digdir/designsystemet-react'
export { Paragraph } from '@digdir/designsystemet-react'
export { Label } from '@digdir/designsystemet-react'

// Wrapper components for specific heading sizes
import { Heading as DSHeading } from '@digdir/designsystemet-react'
import styled from 'styled-components'

export const Heading1 = styled(DSHeading).attrs({ level: 1 })`
    font-size: 4rem;
    margin-top: 2rem;
    margin-bottom: 0.5rem;
`

export const Heading2 = styled(DSHeading).attrs({ level: 2 })`
    font-size: 3rem;
    margin-top: 0;
    margin-bottom: 1rem;
`

export const Heading3 = styled(DSHeading).attrs({ level: 3 })`
    font-size: 2rem;
    margin-top: 0;
    margin-bottom: 1rem;
`

export const Heading4 = styled(DSHeading).attrs({ level: 4 })`
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1rem;
`

export const Heading5 = styled(DSHeading).attrs({ level: 5 })`
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 1rem;
`

export const SmallText = styled.p`
    font-size: 1rem;
`

export const ButtonText = styled.span`
    font-size: 0.75rem;
`
