import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@/components/ui/menubar";
import { Home, Layers, Settings, Info } from "lucide-react";
import { Link } from "react-router";
import { Input } from "../ui/input";
import { ChangeEvent, useState } from "react";
import FuzzySearch from 'fuzzy-search';

//Will be removed once backend is configured and initialized with data
const labs = [
  "Optical Communication Lab",
  "Advanced Digital Communication",
  "Reconfigurable Computing Lab",
  "Microprocessor Lab",
  "Power Systems Lab",
  "Control Systems Lab",
  "Power Electronics Lab",
  "Instrumentation Lab",
  "FPGA Lab",
  "MEMS Lab",
  "Digital Design Lab",
  "Communication Systems Lab",
  "Microelectronics Circuits Lab",
  "Nanoscale Devices Lab",
  "Device & Sensors Characterization Lab",
  "VLSI CAD Lab",
  "High Voltage Lab",
  "PMMD Lab",
  "IoT Lab",
  "Embedded Systems Lab",
  "Analog Electronics Lab",
  "Digital Signal Processing Lab",
  "RF and Microwave Lab",
  "Analog IC Design Lab",
  "Mobile and Personal Communication Lab",
  "Hardware Software Co-Design Lab",
  "Coding Theory and Practice Lab",
  "EM Field and Microwave Lab",
  "Analog and Digital VLSI Design Lab",
  "Computer Architecture Lab",
  "Advanced Computing Lab",
  "Electronic Device Simulation Lab",
  "Signals and Systems Lab",
  "Software for Embedded Systems Lab",
  "DST FIST Lab",
  "CoRAS Lab",
  "ADDRESS Lab",
  "Electrical Machines Lab",
  "CAD for IC Design Lab",
  "IC Fabrication Lab",
];

export const NavBar = () => {
  const [filteredLabs, setFilteredLabs] = useState(labs);

  const handleSearch = (e : ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.trim();
    if (searchQuery === "") {
      setFilteredLabs(labs);
    } else {
      const searcher = new FuzzySearch(labs);
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
          <Layers className="w-5 h-5 mr-2" /> Labs
        </MenubarTrigger>
        <MenubarContent onInteractOutside={() => setFilteredLabs(labs)}>
          <div className="flex flex-col space-y-2 p-1">
            <Input onKeyDown={(e) => e.stopPropagation()} onChange={handleSearch} className="w-52 h-8" placeholder="Search for Lab..." />
            <div className="h-72 grid grid-cols-2 overflow-y-auto">
              {filteredLabs.map((lab, index) => (
                <MenubarItem key={index} className="w-52 h-10">
                  <Link to={`/labs/${lab.toLowerCase().replace(/\s+/g, "-")}`}>{lab}</Link>
                </MenubarItem>
              ))}
            </div>
          </div>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Link to='/settings' className="flex"><Settings className="w-5 h-5 mr-2" /> Settings</Link>
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>
          <Link to='/about' className="flex"><Info className="w-5 h-5 mr-2" /> About</Link>
        </MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  );
};