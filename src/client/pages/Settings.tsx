import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { Laboratory, User } from "src/server/entities/entities";
import { useUserPermissions } from "@/contexts/UserPermissionsProvider";
import { useNavigate, useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import AddUserDialog from "@/components/custom/AddUserDialog";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/axiosInterceptor";

const labColumns: ColumnDef<Laboratory>[] = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
];

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name'},
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'search' as TableFilterType } },
  { accessorFn: (row) => row.permissions ? "Admin" : "Technician", header: 'Permissions', meta: { filterType: 'dropdown' as TableFilterType } },
  { accessorKey: 'laboratories', header: 'Laboratories', cell: ({ row }) => row.original.permissions ? "NA" : row.original.laboratories?.length ? (row.original.laboratories as Laboratory[]).map((lab) => lab.name).join(" ,"): "None" },  
];

const Settings = () => {
  const [searchParams] = useSearchParams()
  const [selectedOption, setSelectedOption] = useState<string | null>(searchParams.get("view"));
  const [data, setData] = useState<Laboratory[] | User[]>([]);
  const [loading, setLoading] = useState(false);
  const userPermissions = useUserPermissions()
  const navigate = useNavigate();

  const [isUserAddDialogOpen, setIsUserAddDialogOpen] = useState(false)

  const fetchData = () => {
    if (selectedOption) {
      if (!['Labs', 'Users'].includes(selectedOption)){
        navigate("", { replace : true })
        setSelectedOption(null)
        return
      }
      setLoading(true);
      api(`/api/${selectedOption.toLowerCase()}`)
        .then(({data}) => {
          setData(data);
          setLoading(false);
        });
    }
  }

  useEffect(() => {
    const addUserParam = searchParams.get('action')
    if (addUserParam) setIsUserAddDialogOpen(true)
    fetchData()
  }, [selectedOption]);

  const handleAddUser = (newUser : Partial<User> & { labIds: string[] } ) => {
    api.post('/api/users',newUser)
    .then(() => {
      fetchData()
      toast.success("User added")
    })
    .catch((err) => {
      console.error({ message: "Error adding user", err })
      toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding user")
    });
  };

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
        {selectedOption && selectedOption === "Users" && (
          <AddUserDialog isOpen={isUserAddDialogOpen} setIsOpen={setIsUserAddDialogOpen} onAddUser={handleAddUser} />
        )}
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
              <DataTable<User> data={data as User[]} columns={userColumns} mainSearchColumn="name" />
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
