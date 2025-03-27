import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import api from "@/axiosInterceptor";
import { Category, NewVendorRequest } from "@/types/types";
import { X } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Textarea } from "../ui/textarea";

interface AddVendorDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddVendor: (newVendor: NewVendorRequest) => void;
}

const AddVendorDialog = ({ isOpen, setIsOpen, onAddVendor }: AddVendorDialogProps) => {
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  const { Field, Subscribe, handleSubmit, reset } = useForm({
    defaultValues: {
      vendorId: undefined as number | undefined,
      name: "",
      pocName: "",
      phoneNumber: "",
      email: "",
      address: "",
      categories: [] as string[],
    } as NewVendorRequest,
    onSubmit: ({ value: data }) => {
      if (!data.vendorId || !data.name || !data.pocName || !data.phoneNumber || !data.email) {
        toast.error("Fields are missing");
        return;
      }
      onAddVendor(data);
      setIsOpen(false);
    },
  });

  useEffect(() => {
    api("/categories?type=Vendor")
      .then(({ data }) => setAvailableCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Add Vendor</Button>
      </DialogTrigger>
      <DialogContent className="!max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          id="vendor-add-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid md:grid-cols-2 md:gap-2">
            <Field name="vendorId">
              {(field) => (
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="vendor-id">Vendor ID</Label>
                  <Input
                    required
                    id="vendor-id"
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </Field>
            <Field name="name">
              {(field) => (
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="vendor-name">Vendor Name</Label>
                  <Input
                    required
                    id="vendor-name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </Field>
            <Field name="pocName">
              {(field) => (
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="poc-name">POC Name</Label>
                  <Input
                    required
                    id="poc-name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </Field>
            <Field name="phoneNumber">
              {(field) => (
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    required
                    id="phone-number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </Field>
          </div>
          <Field name="email">
            {(field) => (
              <>
                <Label htmlFor="email">Email</Label>
                <Input
                  required
                  type="email"
                  id="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </>
            )}
          </Field>
          <Field name="address">
            {(field) => (
              <div className="grid grid-rows-2 h-36">
                <Label htmlFor="vendor-address">Vendor Address</Label>
                <Textarea
                  id="vendor-address"
                  className="resize-none overflow-y-auto"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </Field>
          <Field name="categories">
            {(field) => (
              <>
                <Label htmlFor="vendor-categories">Vendor Categories</Label>
                <Select
                  onValueChange={(value) =>
                    field.handleChange([...field.state.value, value])
                  }
                >
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
                  {field.state.value.map((category, index) => (
                    <div
                      key={index}
                      className="flex p-1 justify-center items-center space-x-1 border-1 border-primary rounded-md"
                    >
                      <span>
                        {
                          availableCategories.find(
                            (availableCategory) =>
                              availableCategory.id === category
                          )?.name
                        }
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          field.handleChange(
                            field.state.value.filter(
                              (prevCategory) => prevCategory !== category
                            )
                          )
                        }
                        className="hover:cursor-pointer text-red-600 hover:text-red-700"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Field>
        </form>
        <DialogFooter>
          <Subscribe
            selector={(state) => [state.canSubmit]}
            children={([canSubmit]) => (
              <>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button disabled={!canSubmit} form="vendor-add-form">
                  Add Vendor
                </Button>
              </>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVendorDialog;
