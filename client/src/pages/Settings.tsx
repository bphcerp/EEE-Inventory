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
import { Category, Laboratory, User, Vendor } from "@/types/types";
import AddVendorDialog from "@/components/custom/AddVendorDialog";
import AddLabDialog from "@/components/custom/AddLabDialog";
import AddVendorCategoryDialog from "@/components/custom/AddVendorCategoryDialog";
import AddInventoryCategoryDialog from "@/components/custom/AddInventoryCategoryDialog";

const labColumns: ColumnDef<Laboratory>[] = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'code', header: 'Code', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'location', header: 'Location', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'technicianInCharge.name', header: 'Technician In Charge'},
  { accessorKey: 'facultyInCharge.name', header: 'Faculty In Charge'},
];

const categoryColumns: ColumnDef<Category>[] = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'code', header: 'Code', meta: { filterType: 'search' as TableFilterType } },
];

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name'},
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'role', header: 'Role', meta: { filterType: 'dropdown' as TableFilterType } },
  // { accessorFn: (row) => row.permissions ? "Admin" : "Technician", header: 'Permissions', meta: { filterType: 'dropdown' as TableFilterType } },
];

const vendorColumns: ColumnDef<Vendor>[] = [
  { accessorKey: 'vendorId', header: 'Vendor ID', meta: { filterType: 'search' as TableFilterType } },
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
  const [isLabAddDialogOpen, setIsLabAddDialogOpen] = useState(false)
  const [isVendorAddDialogOpen, setIsVendorAddDialogOpen] = useState(false)
  const [isVendorCategoryAddDialogOpen, setIsVendorCategoryAddDialogOpen] = useState(false) 
  const [isInventoryCategoryAddDialogOpen, setIsInventoryCategoryAddDialogOpen] = useState(false) 

  const fetchData = () => {
    if (selectedOption) {
      if (!['Labs', 'Users', 'Vendors', 'VendorCategory', 'InventoryCategory'].includes(selectedOption)){
        navigate("", { replace : true })
        setSelectedOption(null)
        return
      }
      setLoading(true);
      api(selectedOption === 'VendorCategory' ? '/categories?type=Vendor' : selectedOption === 'InventoryCategory' ? '/categories?type=Inventory' : `/${selectedOption.toLowerCase()}`)
        .then(({data}) => {
          setData(data);
          setLoading(false);
        });
    }
  }

  useEffect(() => {
    const addItemParam = searchParams.get('action')
    if (addItemParam === 'addUser') setIsUserAddDialogOpen(true)
    else if (addItemParam === 'addLab') setIsLabAddDialogOpen(true)
    else if (addItemParam === 'addVendor') setIsVendorAddDialogOpen(true)
    
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

  const handleAddCategory = (newCategory: Partial<Category>) => {
    api.post('/categories', newCategory)
      .then(() => {
        fetchData();
        toast.success("Vendor category added successfully");
      })
      .catch((err) => {
        console.error({ message: "Error adding vendor category", err });
        toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding vendor category");
      });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <Select value={selectedOption ?? undefined} onValueChange={(value) => {
          setData([])
          navigate(`?view=${value}`)
          setSelectedOption(value)
        }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select a setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Labs">Labs</SelectItem>
            <SelectItem value="Users">Users</SelectItem>
            <SelectItem value="Vendors">Vendors</SelectItem>
            <SelectItem value="VendorCategory">Vendor Category</SelectItem>
            <SelectItem value="InventoryCategory">Inventory Category</SelectItem>
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
        {selectedOption && selectedOption === "VendorCategory" && (
          <AddVendorCategoryDialog isOpen={isVendorCategoryAddDialogOpen} setIsOpen={setIsVendorCategoryAddDialogOpen} onAddCategory={handleAddCategory} />
        )}
        {selectedOption && selectedOption === "InventoryCategory" && (
          <AddInventoryCategoryDialog isOpen={isInventoryCategoryAddDialogOpen} setIsOpen={setIsInventoryCategoryAddDialogOpen} onAddCategory={handleAddCategory} />
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
            ) : selectedOption === 'Vendors' ? (
              <DataTable<Vendor> data={data as Vendor[]} columns={vendorColumns} mainSearchColumn="name" /> // Vendor table
            ) : selectedOption === 'VendorCategory' ? (
              <DataTable<Category> data={data as Category[]} columns={categoryColumns} mainSearchColumn="name" /> // Vendor table
            ) : (
              <DataTable<Category> data={data as Category[]} columns={categoryColumns} mainSearchColumn="name" /> // Vendor table
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
