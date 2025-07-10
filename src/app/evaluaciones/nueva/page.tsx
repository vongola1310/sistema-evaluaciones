'use client'

import { useState,useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

//(camposEvaluacion y otros imports)

export default function NuevaEvaluacion(){
    const {data: session,status} = useSession()
    const router = useRouter()

    //Redirige si no esta autenticado o si no es evluador

    useEffect(()=>{
        if(status=== 'authenticated'){
            router.push('/login')
        }
    }
    
    )
}
