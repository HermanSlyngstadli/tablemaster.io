import React from 'react'
import styled from 'styled-components'
import { Heading2 } from './Typography'

type IngredientsListProps = {
    children?: JSX.Element | JSX.Element[]
    ingredients: string[]
}

const ListContainer = styled.div`
    padding: 1rem;
    margin: 0;
    background: var(--panel-bg-color);
    border-radius: var(--panel-border-radius);
    box-shadow: var(--box-shadow-default);
`

const List = styled.div`
    padding-left: 0;
    margin: 0;
`

const Ingredient = styled.div`
    margin-bottom: 0.5rem;
`

export const IngredientsList = ({ children, ingredients, ...props }: IngredientsListProps) => {
    return (
        <ListContainer {...props}>
            <Heading2>Ingredienser</Heading2>
            <List>
                {ingredients.map((ingredient, index) => (
                    <Ingredient key={index + 'wer'}>{ingredient}</Ingredient>
                ))}
            </List>
            {children}
        </ListContainer>
    )
}
