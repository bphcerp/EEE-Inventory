import { ModeToggle } from "../mode-toggle"
import { NavBar } from "./NavBar"

export const Header = () => {
    return (
        <header className="w-full h-16 flex justify-between items-center px-2">
            <img className="w-12 h-12" src="/logocolor.png" />
            <NavBar />
            <ModeToggle />
        </header>
    )
}