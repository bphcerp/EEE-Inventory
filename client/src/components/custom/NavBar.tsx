import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Home, Settings, Info, Warehouse } from "lucide-react";
import { Link } from "react-router";
import { useUserPermissions } from "@/contexts/UserPermissionsProvider";

export const NavBar = () => {
  const userPermissions = useUserPermissions()

  return (
    <Menubar id="navBar">
      <MenubarMenu>
        <MenubarTrigger>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="w-5 h-5" /> Dashboard
          </Link>
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Link to="/inventory" className="flex items-center gap-2">
            <Warehouse className="w-5 h-5" /> Inventory
          </Link>
        </MenubarTrigger>
      </MenubarMenu>

      { userPermissions ? <MenubarMenu>
        <MenubarTrigger>
          <Link to='/settings' className="flex"><Settings className="w-5 h-5 mr-2" /> Settings</Link>
        </MenubarTrigger>
      </MenubarMenu> : <></>}

      <MenubarMenu>
        <MenubarTrigger>
          <Link to='/about' className="flex"><Info className="w-5 h-5 mr-2" /> About</Link>
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
};