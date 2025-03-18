import { LogOut } from "lucide-react"
import { ModeToggle } from "./ModeToggle"
import { NavBar } from "./NavBar"
import { useNavigate } from "react-router"
import { Button } from "../ui/button"
import { toast } from "sonner"
import api from "@/axiosInterceptor"

export const Header = () => {

    const navigate = useNavigate()

    const handleLogout = () => {
        api.post("/auth/signout")
            .then(() => {
                navigate("/login")
            })
            .catch(err => {
                toast.error("Error signing out!")
                console.error({ message: "Error signing out", err })
            })
    }

    return (
        <header className="w-full shrink-0 h-(--header-height) grid grid-cols-3 items-center px-2">
            <img className="w-12 h-12" src="/logocolor.png" />
            
            <div className="flex items-center justify-center"><NavBar /></div>

            <div className="flex justify-end items-center space-x-2">
                <Button variant="outline" onClick={handleLogout}>Logout <LogOut color="red" /></Button>
                <ModeToggle />
            </div>
        </header>
    )
}