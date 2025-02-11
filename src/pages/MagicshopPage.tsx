import React, { useEffect, useState } from 'react'
import { PageContainer } from '../components/PageContainer'
import { SideNavigation } from '../components/SideNavigation'
import { supabase } from '../supabaseClient'
import { GridContainer, GridItem } from '../components/Grid'
import { Tables } from '../database-generated.types'

export const MagicshopPage = () => {
    const [session, setSession] = useState<any>()
    type ItemType = Tables<'Items'>

    const [itemList, setItemList] = useState<ItemType[]>([])

    async function getItems() {
        let { data: items, error } = await supabase.from('Items').select('*').returns<ItemType[]>()

        if (error) {
            console.error(error)
            return
        }

        if (items) setItemList(items)
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        getItems()

        return () => subscription.unsubscribe()
    }, [])

    console.log(session?.user?.email)

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
    }

    const signUp = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        })
    }

    if (!session) {
        return (
            <>
                {/* <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />; */}
                <PageContainer>
                    <SideNavigation />
                    <div>
                        <button onClick={signUp}>Sign in with Google</button>
                    </div>
                </PageContainer>
            </>
        )
    } else {
        console.log(itemList)
        return (
            <div>
                <PageContainer>
                    <SideNavigation />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <GridContainer>
                            <GridItem large="1 / 7">
                                <div>
                                    <h2>Welcome, {session?.user?.email}</h2>
                                    <button onClick={signOut}>Sign out</button>
                                </div>
                                <div>
                                    {itemList.map((item) => {
                                        return (
                                            <div key={item['id']}>
                                                <h2>{item['name']}</h2>
                                                <div>{item['description']}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </GridItem>
                        </GridContainer>
                    </div>
                </PageContainer>
            </div>
        )
    }
    /*
    return (
        
    )*/
}
