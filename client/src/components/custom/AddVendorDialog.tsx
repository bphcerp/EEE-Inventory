import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import api from "@/axiosInterceptor";
import { Category, Vendor } from "@/types/types";
import { X } from "lucide-react";

interface AddVendorDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddVendor: (newVendor: Partial<Vendor>) => void;
}

const AddVendorDialog = ({ isOpen, setIsOpen, onAddVendor }: AddVendorDialogProps) => {
  const [name, setName] = useState("");
  const [pocName, setPocName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch available categories from the server
    api("/categories?type=Vendor")
      .then(({data}) => setAvailableCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleSubmit = () => {
    if (name && pocName && phoneNumber && email) {
      onAddVendor({ name, pocName, phoneNumber, email, address, categories: categories as any });
      setName("");
      setPocName("");
      setPhoneNumber("");
      setEmail("");
      setAddress("");
      setCategories([]);
      setIsOpen(false);
    }
    else toast.error("Fields are missing")
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Vendor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div>
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input required id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="poc-name">POC Name</Label>
            <Input required id="poc-name" value={pocName} onChange={(e) => setPocName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input required id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input required type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="vendor-address">Vendor Address</Label>
            <Input id="vendor-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="vendor-categories">Vendor Categories</Label>
            <Select onValueChange={(value) => setCategories([...categories, value])}>
              <SelectTrigger id="vendor-categories">
                <span>Select Categories</span>
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {categories.map((category, index) => (
                <div key={index} className="flex p-1 justify-center items-center space-x-1 border-1 border-primary rounded-md">
                  <span>{availableCategories.find((availableCategory) => availableCategory.id === category)?.name}</span>
                  <button type="button" onClick={() => setCategories((prev) => prev.filter(prevCategory => prevCategory != category))} className="hover:cursor-pointer text-red-600 hover:text-red-700"><X size={15} /></button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add Vendor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVendorDialog;
