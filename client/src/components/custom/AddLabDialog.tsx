import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/types";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import api from "@/axiosInterceptor";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"; // Import Label component

interface AddLabDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddLab: (newLab: { name: string; code: string; technicianInChargeId: string; facultyInChargeId: string }) => void;
}

const AddLabDialog = ({ isOpen, setIsOpen, onAddLab }: AddLabDialogProps) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [technicianInChargeId, setTechnicianInChargeId] = useState("");
  const [facultyInChargeId, setFacultyInChargeId] = useState("");
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      api("/users?role=Technician")
        .then(({data}) => setTechnicians(data))
        .catch((err) => toast.error("Failed to fetch technicians:", err));

      api("/users?role=Faculty")
        .then(({data}) => setFaculties(data))
        .catch((err) => toast.error("Failed to fetch faculties:", err));
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (name && code && technicianInChargeId && facultyInChargeId) {
      onAddLab({ name, code, technicianInChargeId, facultyInChargeId });
      setName("");
      setCode("");
      setTechnicianInChargeId("");
      setFacultyInChargeId("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Lab</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lab</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div>
            <Label htmlFor="lab-name">Lab Name</Label>
            <Input required id="lab-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lab-code">Lab Code</Label>
            <Input required id="lab-code" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </div>
          <div>
            <Label htmlFor="technician-in-charge">Technician In Charge</Label>
            <Select value={technicianInChargeId} onValueChange={setTechnicianInChargeId}>
              <SelectTrigger className="w-full">
                <span>{technicianInChargeId ? technicians.find((tech) => tech.id === technicianInChargeId)?.name : "Select Technician In Charge"}</span>
              </SelectTrigger>
              <SelectContent id="technician-in-charge">
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="faculty-in-charge">Faculty In Charge</Label>
            <Select value={facultyInChargeId} onValueChange={setFacultyInChargeId}>
              <SelectTrigger className="w-full">
                <span>{facultyInChargeId ? faculties.find((faculty) => faculty.id === facultyInChargeId)?.name : "Select Faculty In Charge"}</span>
              </SelectTrigger>
              <SelectContent id="technician-in-charge">
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add Lab</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLabDialog;
