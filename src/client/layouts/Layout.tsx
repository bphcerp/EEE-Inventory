import { Header } from "@/components/custom/Header"
import { useUserPermissions } from "@/contexts/UserPermissionsProvider"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"

export const Layout = () => {

    const navigate = useNavigate()
    const userPermissions = useUserPermissions()

    useEffect(() => {
        // Redirect to login if user is not logged in
        if (userPermissions === null) {
            navigate('/login')
        }
    }, [])

    return userPermissions !== null && (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="container max-w-screen p-2">
                <Outlet />
            </div>
        </div>
    )
}