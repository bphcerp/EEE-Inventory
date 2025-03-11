import { LogOut } from "lucide-react"
import { ModeToggle } from "../mode-toggle"
import { NavBar } from "./NavBar"
import axios from "axios"
import { useNavigate } from "react-router"
import { Button } from "../ui/button"

export const Header = () => {

    const navigate = useNavigate()

    const handleLogout = () => {
        axios.post("/api/auth/signout")
            .then(() => {
                navigate("/login")
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <header className="w-full h-16 grid grid-cols-3 items-center px-2">
            <img className="w-12 h-12" src="/logocolor.png" />
            <NavBar />
            <div className="flex justify-end items-center space-x-2">
                <Button variant="outline" onClick={handleLogout}>Logout <LogOut color="red" /></Button>
                <ModeToggle />
            </div>
        </header>
    )
}