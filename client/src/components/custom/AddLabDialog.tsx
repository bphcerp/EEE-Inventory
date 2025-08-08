import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Laboratory, User } from "@/types/types";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import api from "@/axiosInterceptor";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"; // Import Label component
import { useForm } from "@tanstack/react-form";

export interface NewLaboratoryRequest extends Omit<Laboratory, "technicianInCharge" | "facultyInCharge"> {
  technicianInCharge: string
  facultyInCharge: string
}

interface AddLabDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddLab: (newLab: NewLaboratoryRequest, edit?: boolean) => void;
  editInitialData?: Laboratory 
}

const AddLabDialog = ({ isOpen, setIsOpen, onAddLab, editInitialData }: AddLabDialogProps) => {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<User[]>([]);

  const { Field, Subscribe, handleSubmit, reset } = useForm({
    defaultValues: {
      name: editInitialData?.name ?? "",
      code: editInitialData?.code ?? "",
      location: editInitialData?.location ?? "",
      technicianInCharge: editInitialData?.technicianInCharge?.id ?? "",
      facultyInCharge: editInitialData?.facultyInCharge?.id ?? "",
    } as NewLaboratoryRequest,
    onSubmit: ({ value: data ,formApi: form }) => {
      if (!data.name || !data.code || !data.location || !data.technicianInCharge || !data.facultyInCharge) {
        toast.error("Some fields are missing");
        return;
      }

      const dirtyFields = Object.entries(form.state.fieldMetaBase).filter(([_key, value]) => value.isDirty).map(([key]) => key)
      
      if (editInitialData) onAddLab(Object.fromEntries(Object.entries(data).filter(([key]) => dirtyFields.includes(key))) as NewLaboratoryRequest, true)
      else onAddLab(data)
      setIsOpen(false);
    },
  });

  useEffect(() => {
    if (isOpen) {
      api("/users?role=Technician")
        .then(({ data }) => setTechnicians(data))
        .catch((err) => toast.error("Failed to fetch technicians:", err));

      api("/users?role=Faculty")
        .then(({ data }) => setFaculties(data))
        .catch((err) => toast.error("Failed to fetch faculties:", err));
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        reset();
      }}
    >
      <DialogTrigger asChild>
        { editInitialData ? <Button disabled={true} variant="outline" className="text-blue-500 hover:text-blue-700 hover:bg-background">Edit Lab</Button> : <Button disabled={true}>Add Lab</Button> }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editInitialData ? "Edit Lab" : "Add New Lab"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          id="lab-add-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field name="name">
            {({ state, handleChange, handleBlur }) => (
              <>
                <Label htmlFor="lab-name">Lab Name</Label>
                <Input
                  id="lab-name"
                  required
                  value={state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                />
              </>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field name="code">
              {({ state, handleChange, handleBlur }) => (
                <>
                  <Label htmlFor="lab-code">Lab Code</Label>
                  <Input
                    id="lab-code"
                    required
                    maxLength={4}
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value.toUpperCase())}
                    onBlur={handleBlur}
                  />
                </>
              )}
            </Field>
            <Field name="location">
              {({ state, handleChange, handleBlur }) => (
                <>
                  <Label htmlFor="lab-location">Lab Location</Label>
                  <Input
                    id="lab-location"
                    required
                    pattern="^[A-Z]-\d{3}[A-Z]?$"
                    title="Location of the lab (Ex. J-106, W-101)"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value.toUpperCase())}
                    onBlur={handleBlur}
                  />
                </>
              )}
            </Field>
          </div>
          <Field name="technicianInCharge">
            {({ state, handleChange }) => (
              <>
                <Label htmlFor="technician-in-charge">Technician In Charge</Label>
                <Select
                  value={state.value}
                  onValueChange={(value) => handleChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <span>
                      {state.value
                        ? technicians.find((tech) => tech.id === state.value)
                          ?.name
                        : "Select Technician In Charge"}
                    </span>
                  </SelectTrigger>
                  <SelectContent id="technician-in-charge">
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </Field>
          <Field name="facultyInCharge">
            {({ state, handleChange }) => (
              <>
                <Label htmlFor="faculty-in-charge">Faculty In Charge</Label>
                <Select
                  value={state.value}
                  onValueChange={(value) => handleChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <span>
                      {state.value
                        ? faculties.find((faculty) => faculty.id === state.value)
                          ?.name
                        : "Select Faculty In Charge"}
                    </span>
                  </SelectTrigger>
                  <SelectContent id="technician-in-charge">
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </Field>
        </form>
        <DialogFooter>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Subscribe
            selector={(state) => [state.canSubmit]}
            children={([canSubmit]) => (
              <Button disabled={!canSubmit} form="lab-add-form">
                { editInitialData ? "Edit Lab" : "Add Lab" }
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLabDialog;
