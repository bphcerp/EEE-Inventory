import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, TableFilterType } from "@/components/custom/DataTable";
import { useNavigate, useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import AddUserDialog from "@/components/custom/AddUserDialog";
import { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/axiosInterceptor";
import { Category, Laboratory, User, Vendor, NewUserRequest, NewVendorRequest, NewCategoryRequest } from "@/types/types";
import AddVendorDialog from "@/components/custom/AddVendorDialog";
import AddLabDialog, { NewLaboratoryRequest } from "@/components/custom/AddLabDialog";
import AddVendorCategoryDialog from "@/components/custom/AddVendorCategoryDialog";
import AddInventoryCategoryDialog from "@/components/custom/AddInventoryCategoryDialog";
import DeleteConfirmationDialog from "@/components/custom/DeleteConfirmationDialog";

const labColumns: ColumnDef<Laboratory>[] = [
  { accessorKey: 'createdAt', header: 'Created At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'updatedAt', header: 'Updated At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'code', header: 'Code', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'location', header: 'Location', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'technicianInCharge.name', header: 'Technician In Charge' },
  { accessorKey: 'facultyInCharge.name', header: 'Faculty In Charge' },
];

const categoryColumns: ColumnDef<Category>[] = [
  { accessorKey: 'createdAt', header: 'Created At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'updatedAt', header: 'Updated At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'code', header: 'Code', meta: { filterType: 'search' as TableFilterType } },
];

const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'createdAt', header: 'Created At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'updatedAt', header: 'Updated At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'search' as TableFilterType } },
  { accessorKey: 'role', header: 'Role', meta: { filterType: 'dropdown' as TableFilterType } },
  // { accessorFn: (row) => row.permissions ? "Admin" : "Technician", header: 'Permissions', meta: { filterType: 'dropdown' as TableFilterType } },
];

const vendorColumns: ColumnDef<Vendor>[] = [
  { accessorKey: 'createdAt', header: 'Created At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
  { accessorKey: 'updatedAt', header: 'Updated At', cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(), enableColumnFilter: false },
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
  const [data, setData] = useState<Laboratory[] | User[] | Vendor[] | Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isUserAddDialogOpen, setIsUserAddDialogOpen] = useState(false)
  const [isLabAddDialogOpen, setIsLabAddDialogOpen] = useState(false)
  const [isVendorAddDialogOpen, setIsVendorAddDialogOpen] = useState(false)
  const [isVendorCategoryAddDialogOpen, setIsVendorCategoryAddDialogOpen] = useState(false)
  const [isInventoryCategoryAddDialogOpen, setIsInventoryCategoryAddDialogOpen] = useState(false)

  const [selected, setSelected] = useState<Laboratory[] | User[] | Vendor[] | Category[]>([])

  const fetchData = () => {
    if (selectedOption) {
      if (!['Labs', 'Users', 'Vendors', 'VendorCategory', 'InventoryCategory'].includes(selectedOption)) {
        navigate("", { replace: true })
        setSelectedOption(null)
        return
      }
      setLoading(true);
      api(selectedOption === 'VendorCategory' ? '/categories?type=Vendor' : selectedOption === 'InventoryCategory' ? '/categories?type=Inventory' : `/${selectedOption.toLowerCase()}`)
        .then(({ data }) => {
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

  const handleAddUser = (newUser: NewUserRequest, edit?: boolean) => {
    if (edit) {
      api.patch(`/users/${selected[0].id}`, {...newUser, id: selected[0].id})
        .then(() => {
          fetchData();
          toast.success("User edited successfully");
        })
        .catch((err) => {
          console.error({ message: "Error editing user", err });
          toast.error(((err as AxiosError).response?.data as any).message ?? "Error editing user");
        });
    } else {
      api.post('/users', newUser)
        .then(() => {
          fetchData();
          toast.success("User added successfully");
        })
        .catch((err) => {
          console.error({ message: "Error adding user", err });
          toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding user");
        });
    }
  };

  const handleAddLab = (newLab: NewLaboratoryRequest, edit?: boolean) => {
    if (edit){
      api.patch(`/labs/${selected[0].id}`, {...newLab, id: selected[0].id})
      .then(() => {
        fetchData();
        toast.success("Lab edited successfully");
      })
      .catch((err) => {
        console.error({ message: "Error editing lab", err });
        toast.error(((err as AxiosError).response?.data as any).message ?? "Error editing lab");
      });
    }
    else{
      api.post('/labs', newLab)
      .then(() => {
        fetchData();
        toast.success("Lab added successfully");
      })
      .catch((err) => {
        console.error({ message: "Error adding lab", err });
        toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding lab");
      });
    }
  };

  const handleAddVendor = (newVendor: NewVendorRequest, edit?: boolean) => {
    if (edit) {
      api.patch(`/vendors/${selected[0].id}`, {...newVendor, id: selected[0].id})
        .then(() => {
          fetchData();
          toast.success("Vendor edited successfully");
        })
        .catch((err) => {
          console.error({ message: "Error editing vendor", err });
          toast.error(((err as AxiosError).response?.data as any).message ?? "Error editing vendor");
        });
    } else {
      api.post('/vendors', newVendor)
        .then(() => {
          fetchData();
          toast.success("Vendor added successfully");
        })
        .catch((err) => {
          console.error({ message: "Error adding vendor", err });
          toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding vendor");
        });
    }
  };

  const handleAddCategory = (newCategory: NewCategoryRequest, type: "Vendor" | "Inventory", edit?: boolean) => {
    if (edit) {
      api.patch(`/categories/${selected[0].id}`, { ...newCategory,id: selected[0].id, type })
        .then(() => {
          fetchData();
          toast.success("Category edited successfully");
        })
        .catch((err) => {
          console.error({ message: "Error editing category", err });
          toast.error(((err as AxiosError).response?.data as any).message ?? "Error editing category");
        });
    } else {
      api.post('/categories', { ...newCategory, type })
        .then(() => {
          fetchData();
          toast.success("Category added successfully");
        })
        .catch((err) => {
          console.error({ message: "Error adding category", err });
          toast.error(((err as AxiosError).response?.data as any).message ?? "Error adding category");
        });
    }
  };

  const handleDelete = () => {
    if (!selectedOption || selected.length !== 1) return;
  
    const route =
      selectedOption === "VendorCategory"
        ? `/categories/${selected[0].id}`
        : selectedOption === "InventoryCategory"
        ? `/categories/${selected[0].id}`
        : `/${selectedOption.toLowerCase()}/${selected[0].id}`;
  
    api
      .delete(route)
      .then(() => {
        fetchData();
        toast.success("Item deleted successfully");
      })
      .catch((err) => {
        console.error({ message: "Error deleting item", err });
        toast.error(((err as AxiosError).response?.data as any).message ?? "Error deleting item");
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
        <div className="flex space-x-2">
          {selectedOption && !!selected.length && (
            <DeleteConfirmationDialog onConfirm={handleDelete} />
          )}
          {selectedOption && selectedOption === "Users" && (
            <AddUserDialog
              editInitialData={selected.length === 1 ? selected[0] as User : undefined}
              isOpen={isUserAddDialogOpen}
              setIsOpen={setIsUserAddDialogOpen}
              onAddUser={(data) => handleAddUser(data, selected.length === 1)}
            />
          )}
          {selectedOption && selectedOption === "Labs" && (
            <AddLabDialog editInitialData={selected.length === 1 ? selected[0] as Laboratory : undefined} isOpen={isLabAddDialogOpen} setIsOpen={setIsLabAddDialogOpen} onAddLab={handleAddLab} />
          )}
          {selectedOption && selectedOption === "Vendors" && (
            <AddVendorDialog
              editInitialData={selected.length === 1 ? selected[0] as Vendor : undefined}
              isOpen={isVendorAddDialogOpen}
              setIsOpen={setIsVendorAddDialogOpen}
              onAddVendor={(data) => handleAddVendor(data, selected.length === 1)}
            />
          )}
          {selectedOption && selectedOption === "VendorCategory" && (
            <AddVendorCategoryDialog
              editInitialData={selected.length === 1 ? selected[0] as Category : undefined}
              isOpen={isVendorCategoryAddDialogOpen}
              setIsOpen={setIsVendorCategoryAddDialogOpen}
              onAddCategory={(data) => handleAddCategory(data, "Vendor", selected.length === 1)}
            />
          )}
          {selectedOption && selectedOption === "InventoryCategory" && (
            <AddInventoryCategoryDialog
              editInitialData={selected.length === 1 ? selected[0] as Category : undefined}
              isOpen={isInventoryCategoryAddDialogOpen}
              setIsOpen={setIsInventoryCategoryAddDialogOpen}
              onAddCategory={(data) => handleAddCategory(data, "Inventory", selected.length === 1)}
            />
          )}
        </div>
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
              <DataTable<Laboratory> data={data as Laboratory[]} columns={labColumns} mainSearchColumn="name" setSelected={setSelected as any} />
            ) : selectedOption === "Users" ? (
              <DataTable<User> data={data as User[]} columns={userColumns} mainSearchColumn="name" setSelected={setSelected as any} />
            ) : selectedOption === 'Vendors' ? (
              <DataTable<Vendor> data={data as Vendor[]} columns={vendorColumns} mainSearchColumn="name" setSelected={setSelected as any} /> // Vendor table
            ) : selectedOption === 'VendorCategory' ? (
              <DataTable<Category> data={data as Category[]} columns={categoryColumns} mainSearchColumn="name" setSelected={setSelected as any} /> // Vendor table
            ) : (
              <DataTable<Category> data={data as Category[]} columns={categoryColumns} mainSearchColumn="name" setSelected={setSelected as any} /> // Vendor table
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
