import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { Laboratory, User } from "src/server/entities/entities";
import { ChevronDown } from "lucide-react";
import { useUserPermissions } from "@/contexts/UserPermissionsProvider";

const Settings = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [data, setData] = useState<Laboratory[] | User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedOption) {
      setLoading(true);
      fetch(`/api/${selectedOption.toLowerCase()}`)
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    }
  }, [selectedOption]);

  const userPermissions = useUserPermissions()

  const columns = React.useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => !key.toLowerCase().includes('id')).map((key) => ({
      accessorKey: key,
      meta: {
        filterType: 'search' as TableFilterType
      },
      header: key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }, [data]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Settings <ChevronDown/> </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setSelectedOption("Labs")}>Labs</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSelectedOption("Users")}>Users</DropdownMenuItem>
        </DropdownMenuContent>  
      </DropdownMenu>
      { userPermissions && selectedOption && <Button >Add {selectedOption?.slice(0,-1)}</Button> }
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="mt-4">
          {data.length > 0 && (
            selectedOption === "Labs" ? (
              <DataTable<Laboratory> data={data as Laboratory[]} columns={columns} mainSearchColumn="name" />
            ) : (
              <DataTable<User> data={data as User[]} columns={columns} mainSearchColumn="email" />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
