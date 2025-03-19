import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddVendorDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddVendor: (newVendor: { name: string; pocName: string; phoneNumber: string; email: string; address: string }) => void;
}

const AddVendorDialog = ({ isOpen, setIsOpen, onAddVendor }: AddVendorDialogProps) => {
  const [name, setName] = useState("");
  const [pocName, setPocName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = () => {
    if (name && pocName && phoneNumber && email) {
      onAddVendor({ name, pocName, phoneNumber, email, address });
      setName("");
      setPocName("");
      setPhoneNumber("");
      setEmail("");
      setAddress("");
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
