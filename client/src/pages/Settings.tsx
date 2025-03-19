import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import AddUserDialog from "@/components/custom/AddUserDialog";
import { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/axiosInterceptor";
import { Laboratory, User, Vendor } from "@/types/types";
import AddVendorDialog from "@/components/custom/AddVendorDialog";
import AddLabDialog from "@/components/custom/AddLabDialog";

const labColumns: ColumnDef<Laboratory>[] = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'code', header: 'Code', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'technicianInCharge.name', header: 'Technician In Charge'},
  { accessorKey: 'facultyInCharge.name', header: 'Faculty In Charge'},
];

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name'},
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'role', header: 'Role', meta: { filterType: 'dropdown' as TableFilterType } },
  // { accessorFn: (row) => row.permissions ? "Admin" : "Technician", header: 'Permissions', meta: { filterType: 'dropdown' as TableFilterType } },
];

const vendorColumns: ColumnDef<Vendor>[] = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'address', header: 'Address' },
  { accessorKey: 'pocName', header: 'POC Name' },
  { accessorKey: 'phoneNumber', header: 'Phone Number' },
  { accessorKey: 'email', header: 'Email' },
];

const Settings = () => {
  const [searchParams] = useSearchParams()
  const [selectedOption, setSelectedOption] = useState<string | null>(searchParams.get("view"));
  const [data, setData] = useState<Laboratory[] | User[] | Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation()

  const [isUserAddDialogOpen, setIsUserAddDialogOpen] = useState(false)
  const [isLabAddDialogOpen, setIsLabAddDialogOpen] = useState(false); // State for AddLabDialog
  const [isVendorAddDialogOpen, setIsVendorAddDialogOpen] = useState(false); // State for AddVendorDialog

  const fetchData = () => {
    if (selectedOption) {
      if (!['Labs', 'Users', 'Vendors'].includes(selectedOption)){
        navigate("", { replace : true })
        setSelectedOption(null)
        return
      }
      setLoading(true);
      api(`/${selectedOption.toLowerCase()}`)
        .then(({data}) => {
          setData(data);
          setLoading(false);
        });
    }
  }

  useEffect(() => {
    console.log(selectedOption)
    const addUserParam = searchParams.get('action') === 'addUser'
    if (addUserParam) setIsUserAddDialogOpen(true)
    fetchData()
  }, [selectedOption]);

  const handleAddUser = (newUser : Partial<User> & { labIds: string[] } ) => {
    api.post('/users',newUser)
    .then(() => {
      fetchData()
      const addUserParam = searchParams.get('action') === 'addUser'
      toast.success(`User added${addUserParam?' Redirecting...':''}`)
      if (addUserParam) navigate('/add-item',{
        state: location.state
      })
    })
    .catch((err) => {
      console.error({ message: "Error adding user", err })
      toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding user")
    });
  };

  const handleAddLab = (newLab: Partial<Laboratory>) => {
    api.post('/labs', newLab)
      .then(() => {
        fetchData();
        toast.success("Lab added successfully");
      })
      .catch((err) => {
        console.error({ message: "Error adding lab", err });
        toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding lab");
      });
  };

  const handleAddVendor = (newVendor: Partial<Vendor>) => {
    api.post('/vendors', newVendor)
      .then(() => {
        fetchData();
        toast.success("Vendor added successfully");
      })
      .catch((err) => {
        console.error({ message: "Error adding vendor", err });
        toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding vendor");
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
            <SelectItem value="Vendors">Vendors</SelectItem> {/* Add Vendors option */}
          </SelectContent>
        </Select>
        {selectedOption && selectedOption === "Users" && (
          <AddUserDialog isOpen={isUserAddDialogOpen} setIsOpen={setIsUserAddDialogOpen} onAddUser={handleAddUser} />
        )}
        {selectedOption && selectedOption === "Labs" && (
          <AddLabDialog isOpen={isLabAddDialogOpen} setIsOpen={setIsLabAddDialogOpen} onAddLab={handleAddLab} />
        )}
        {selectedOption && selectedOption === "Vendors" && (
          <AddVendorDialog isOpen={isVendorAddDialogOpen} setIsOpen={setIsVendorAddDialogOpen} onAddVendor={handleAddVendor} />
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
            ) : selectedOption === "Users" ? (
              <DataTable<User> data={data as User[]} columns={userColumns} mainSearchColumn="name" />
            ) : (
              <DataTable<Vendor> data={data as Vendor[]} columns={vendorColumns} mainSearchColumn="name" /> // Vendor table
            )
          ) : <div>
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-lg text-gray-500">No data available</p>
              {!selectedOption && <p className="text-sm text-gray-400">Please select a setting to view the data</p>}
            </div>
          </div>}
        </div>
      )}
    </div>
  );
};

export default Settings;
