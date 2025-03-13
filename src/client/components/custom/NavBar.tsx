import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { Home, Layers, Settings, Info, ChartColumn } from "lucide-react";
import { Link } from "react-router";
import { Input } from "../ui/input";
import { ChangeEvent, useEffect, useState } from "react";
import FuzzySearch from 'fuzzy-search';
import { Laboratory } from "src/server/entities/entities";
import { useUserPermissions } from "@/contexts/UserPermissionsProvider";
import { toast } from "sonner";

export const NavBar = () => {
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [filteredLabs, setFilteredLabs] = useState<Laboratory[]>([])
  const userPermissions = useUserPermissions()

  useEffect(() => {
    fetch('/api/labs').then(res => res.json()).then(data => {
      setLabs(data);
      setFilteredLabs(data);
    })
      .catch(err => {
        toast.error("Error fetching labs")
        console.error({ message: "Error fetching labs", err })
      });
  }, [])

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.trim();
    if (searchQuery === "") {
      setFilteredLabs(labs);
    } else {
      const searcher = new FuzzySearch(labs, ['name'], { caseSensitive: false });
      setFilteredLabs(searcher.search(searchQuery));
    }
  };

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
          <Link to="/stats" className="flex items-center gap-2">
            <ChartColumn className="w-5 h-5" /> Stats
          </Link>
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="hover:cursor-pointer">
          <Layers className="w-5 h-5 mr-2" /> Labs
        </MenubarTrigger>
        <MenubarContent onInteractOutside={() => setFilteredLabs(labs)}>
          <div className="flex flex-col space-y-2 p-1">
            <Input onKeyDown={(e) => e.stopPropagation()} onChange={handleSearch} className="w-52 h-8" placeholder="Search for Lab..." />
            <div className="max-h-72 grid grid-cols-2 overflow-y-auto gap-1">
              {filteredLabs.map((lab, index) => (
                <Link  to={`/labs/${lab.id}`} key={lab.id}>
                  <MenubarItem key={index} className={`hover:cursor-pointer w-52 h-10 ${(Math.floor(index / 2) + (index % 2)) % 2 !== 0 && "bg-zinc-100 hover:bg-zinc-200! dark:bg-zinc-900 dark:hover:bg-zinc-800!"}`}>
                    {lab.name}
                  </MenubarItem>
                </Link>
              ))}
            </div>
          </div>
        </MenubarContent>
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