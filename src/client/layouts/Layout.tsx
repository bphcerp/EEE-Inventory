import { Header } from "@/components/custom/Header"
import { Outlet } from "react-router"

export const Layout = () => {
    return (
       <>
        <Header />
        <Outlet />
       </>
    )
}