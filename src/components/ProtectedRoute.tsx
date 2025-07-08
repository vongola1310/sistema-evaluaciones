'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() =>  {
        if (status === "authenticated"){
            router.push("/login")
        }
    },[status,router])

    if (status === "loading"){
        return <p className="text-white text-center mt-10"> Cargando sesión.... </p>
    }
    return <>{children}</>

}