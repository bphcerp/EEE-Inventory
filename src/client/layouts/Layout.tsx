import { Header } from "@/components/custom/Header"
import { UserPermissionsProvider } from "@/contexts/UserPermissionsProvider"
import { Outlet } from "react-router"

export const Layout = () => {
    return (
       <UserPermissionsProvider>
        <Header />
        <Outlet />
       </UserPermissionsProvider>
    )
}