import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { Laboratory, User } from "src/server/entities/entities";
import { useUserPermissions } from "@/contexts/UserPermissionsProvider";
import { useNavigate, useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";

const labColumns: ColumnDef<Laboratory>[] = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
];

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'search' as TableFilterType } },
  { accessorFn: (row) => row.permissions ? "Admin" : "Technician", header: 'Permissions', meta: { filterType: 'dropdown' as TableFilterType } },
  { accessorKey: 'laboratories', header: 'Laboratories', cell: ({ row }) => row.original.permissions ? "NA" : row.original.laboratories?.length ? (row.original.laboratories as Laboratory[]).map((lab) => lab.name).join(" ,"): "None" },  
];

const Settings = () => {
  const [selectedOptionParam] = useSearchParams()
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedOptionParam.get("view"));
  const [data, setData] = useState<Laboratory[] | User[]>([]);
  const [loading, setLoading] = useState(false);
  const userPermissions = useUserPermissions()
  const navigate = useNavigate();

  useEffect(() => {
    if (!userPermissions) {
      // IRedirect to the dashboard if the user has no read and write permissions (user.permissions = 1 )
      navigate('/dashboard');
    }
  }, [userPermissions]);

  useEffect(() => {
    if (selectedOption) {
      if (!['Labs', 'Users'].includes(selectedOption)){
        navigate("", { replace : true })
        setSelectedOption(null)
        return
      }
      setLoading(true);
      fetch(`/api/${selectedOption.toLowerCase()}`)
        .then((response) => response.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    }
  }, [selectedOption]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <Select value={selectedOption ?? undefined} onValueChange={(value) => {
          navigate(`?view=${value}`)
          setSelectedOption(value)
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Labs">Labs</SelectItem>
            <SelectItem value="Users">Users</SelectItem>
          </SelectContent>
        </Select>
        {selectedOption && <Button >Add {selectedOption?.slice(0, -1)}</Button>}
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="mt-4">
          {data.length > 0 ? (
            selectedOption === "Labs" ? (
              <DataTable<Laboratory> data={data as Laboratory[]} columns={labColumns} mainSearchColumn="name" />
            ) : (
              <DataTable<User> data={data as User[]} columns={userColumns} mainSearchColumn="email" />
            )
          ) : <div>
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-lg text-gray-500">No data available</p>
              <p className="text-sm text-gray-400">Please select a setting to view the data</p>
            </div>
          </div>}
        </div>
      )}
    </div>
  );
};

export default Settings;
