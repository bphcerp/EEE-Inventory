import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/axiosInterceptor";
import { Laboratory, User } from "src/server/entities/entities";
import { useForm } from "@tanstack/react-form";
import FuzzySearch from "fuzzy-search";
import { Link } from "react-router";

const AddInventoryItem = () => {
    const [labs, setLabs] = useState<Laboratory[]>([]);
    const [filteredLabs, setFilteredLabs] = useState<Laboratory[]>([]);

    const [faculties, setFaculties] = useState<string[]>([])
    const [filteredFaculties, setFilteredFaculties] = useState<string[]>([]);

    const [technicians, setTechnicians] = useState<User[]>([])
    const [filteredTechnicians, setFilteredTechnicians] = useState<User[]>([]);


    useEffect(() => {
        api("/api/labs").then(({ data }) => {
            setLabs(data)
            setFilteredLabs(data)
        });

        api("/api/users?filter=0").then(({ data }) => {
            setTechnicians(data)
        });

        api("/api/inventory/faculties").then(({ data }) => {
            setFaculties(data)
        });

    }, []);

    const { Field, Subscribe, handleSubmit } = useForm({
        defaultValues: {
            labId: "",
            itemCategory: "",
            itemName: "",
            specifications: "",
            quantity: 0,
            noOfLicenses: null as number | null,
            natureOfLicense: "",
            yearOfLease: null as number | null,
            itemAmountInPO: 0,
            poNumber: "",
            poDate: null as Date | null,
            labInchargeAtPurchase: "",
            labTechnicianAtPurchase: "",
            equipmentID: "",
            fundingSource: "",
            dateOfInstallation: null as Date | null,
            vendorName: "",
            vendorAddress: "",
            vendorPOCName: "",
            vendorPOCPhoneNumber: "",
            vendorPOCEmailID: "",
            warrantyFrom: null as Date | null,
            warrantyTo: null as Date | null,
            amcFrom: null as Date | null,
            amcTo: null as Date | null,
            currentLocation: "",
            status: "Working" as "Working" | "Not Working" | null,
            remarks: "",
            softcopyOfPO: null as File | null,
            softcopyOfInvoice: null as File | null,
            softcopyOfNFA: null as File | null,
            softcopyOfAMC: null as File | null,
            equipmentPhoto: null as File | null,
        },
        onSubmit: ({ value: data }) => {
            console.log(data)
            // onAddItem(data);
        },
    });

    return (
        <div className="flex flex-col p-5">

            <span className="flex justify-center items-center mt-2 mb-10 w-full text-3xl text-primary text-center">Add an item to the inventory</span>

            {/* Left Side - Form Fields */}
            <form className="flex flex-col space-y-6" id="inventory-form" onSubmit={handleSubmit}>
                <span className="text-2xl text-zinc-600">Item Details</span>
                <div className="grid grid-cols-3 gap-4">
                    <Field name="equipmentID">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Equipment ID</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="itemCategory">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Item Category</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="itemName">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Item Name</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="quantity">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value))} required />
                            </div>
                        )}
                    </Field>
                    <Field name="currentLocation">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Current Location</Label>
                                <Input placeholder="Ex: J-106, W-101" title="Please enter a valid room no (Ex. J-106, W-101)" pattern="^[A-Z]-\d{3}$" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="status">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Status</Label>
                                <Select value={field.state.value ?? "NA"} onValueChange={(value) => field.handleChange((value === "NA" ? null : value) as 'Working' | 'Not Working' | null)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Working"><span className="text-green-600 dark:text-green-500">Working</span></SelectItem>
                                        <SelectItem value="Not Working"><span className="text-red-600 dark:text-red-500">Not Working</span></SelectItem>
                                        <SelectItem value="NA">Not Applicable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </Field>
                    <Field name="specifications">
                        {(field) => (
                            <div className="col-span-2 flex flex-col space-y-2">
                                <Label>Specifications</Label>
                                <Textarea value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                </div>
                <span className="text-2xl text-zinc-600">Lab Details</span>
                <div className="grid grid-cols-3 gap-4">
                    <Field name="labId">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Lab</Label>
                                <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                    <SelectTrigger className="w-52">
                                        <SelectValue placeholder="Select Lab" />
                                    </SelectTrigger>
                                    <SelectContent onPointerDownOutside={() => setFilteredLabs(labs)}>
                                        <div className="grid grid-cols-4 gap-x-2">
                                            <Input name="lab" onKeyDown={(e) => e.stopPropagation()} className="col-span-3" placeholder="Search Labs..." onChange={(e) => {
                                                const searcher = new FuzzySearch(labs, ['name'], { caseSensitive: false });
                                                setFilteredLabs(searcher.search(e.target.value));
                                            }} />
                                            {!filteredLabs.length ? <Button>Add</Button> : <></>} </div>
                                        {filteredLabs.map((lab) => (
                                            <SelectItem key={lab.id} value={lab.id}>
                                                {lab.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </Field>
                    <Field name="labInchargeAtPurchase">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Lab In-charge at Purchase</Label>
                                <Select value={field.state.value} onValueChange={(value) => {
                                    console.log(value)
                                    field.handleChange(value)
                                }}>
                                    <SelectTrigger className="w-52">
                                        <SelectValue placeholder="Select Lab In-charge" />
                                    </SelectTrigger>
                                    <SelectContent onPointerDownOutside={() => setFilteredFaculties(faculties)}>
                                        <form id="newFacultyForm" className="grid grid-cols-4 gap-x-2" onKeyDown={(e) => e.stopPropagation()} onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                            e.preventDefault()
                                            e.stopPropagation()

                                            const formData = new FormData(e.target as HTMLFormElement)
                                            const newFaculty = formData.get('facultySearch')!.toString()
                                            setFaculties((prev) => [newFaculty, ...prev])
                                            field.setValue(newFaculty)

                                        }}><Input name="facultySearch" className="col-span-3" placeholder="Search Faculties..." onChange={(e) => {
                                            const searcher = new FuzzySearch(faculties, [''], { caseSensitive: false });
                                            setFaculties(searcher.search(e.target.value));
                                        }} />
                                            <Button form="newFacultyForm" onClick={() => setFilteredLabs(labs)}>Add</Button></form>
                                        {faculties.map((incharge, i) => (
                                            <SelectItem key={i} value={incharge}>
                                                {incharge}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </Field>
                    <Field name="labTechnicianAtPurchase">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Lab Technician at Purchase</Label>
                                <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                                    <SelectTrigger className="w-52">
                                        <SelectValue placeholder="Select Lab Technician" />
                                    </SelectTrigger>
                                    <SelectContent onPointerDownOutside={() => setFilteredTechnicians(technicians)}>
                                        {technicians.length ? <Input onKeyDown={(e) => e.stopPropagation()} className="col-span-3" placeholder="Search Technicians..." onChange={(e) => {
                                            const searcher = new FuzzySearch(technicians, ['name'], { caseSensitive: false });
                                            setFilteredTechnicians(searcher.search(e.target.value));
                                        }} /> : <div className="grid grid-cols-4">
                                            <SelectItem className="col-span-3" value="NA" disabled>No Technicians Added</SelectItem>
                                            <Link to="/settings?view=Users&&action=addUser"><Button>Add</Button></Link>
                                        </div>}
                                        {technicians.map((technician) => (
                                            <SelectItem key={technician.id} value={technician.id}>
                                                {technician.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </Field>
                </div>
                <span className="text-2xl text-zinc-600">License & Registration</span>
                <div className="grid grid-cols-3 gap-4">
                    <Field name="noOfLicenses">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>No. of Licenses</Label>
                                <Input type="number" value={field.state.value?.toString()} onChange={(e) => field.handleChange(parseInt(e.target.value))} />
                            </div>
                        )}
                    </Field>
                    <Field name="natureOfLicense">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Nature of License</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )}
                    </Field>
                    <Field name="yearOfLease">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Year of Lease</Label>
                                <Input type="number" value={field.state.value?.toString()} onChange={(e) => field.handleChange(parseInt(e.target.value))} />
                            </div>
                        )}
                    </Field>
                    <Field name="itemAmountInPO">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Item Amount in PO</Label>
                                <Input type="number" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value))} required />
                            </div>
                        )}
                    </Field>
                    <Field name="poNumber">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>PO Number</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="poDate">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>PO Date</Label>
                                <Input type="date" value={field.state.value?.toISOString().split("T")[0]} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="fundingSource">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Funding Source</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="dateOfInstallation">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Date of Installation</Label>
                                <Input type="date" value={field.state.value?.toISOString().split("T")[0]} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                            </div>
                        )}
                    </Field>
                </div>

                <span className="text-2xl text-zinc-600">Vendor Information</span>
                <div className="grid grid-cols-3 gap-4">
                    <Field name="vendorName">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Vendor Name</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="vendorAddress">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Vendor Address</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="vendorPOCName">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Vendor POC Name</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="vendorPOCPhoneNumber">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Vendor POC Phone Number</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                    <Field name="vendorPOCEmailID">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Vendor POC Email ID</Label>
                                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} required />
                            </div>
                        )}
                    </Field>
                </div>
                <span className="text-2xl text-zinc-600">Warranty & AMC</span>
                <div className="grid grid-cols-3 gap-4">
                    <Field name="warrantyFrom">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Warranty From</Label>
                                <Input type="date" value={field.state.value?.toISOString().split("T")[0]} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                            </div>
                        )}
                    </Field>
                    <Subscribe selector={(state) => [state.values.warrantyFrom]} children={([warrantyFrom]) => (
                        <Field name="warrantyTo">
                            {(field) => (
                                <div className="flex flex-col space-y-2">
                                    <Label>Warranty To</Label>
                                    <Input type="date" {...(warrantyFrom !== null ? ({ min: warrantyFrom.toISOString().split("T")[0] }) : {})} value={field.state.value?.toISOString().split("T")[0]} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                                </div>
                            )}
                        </Field>
                    )} />
                    <Field name="amcFrom">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>AMC From</Label>
                                <Input type="date" value={field.state.value?.toISOString().split("T")[0]} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                            </div>
                        )}
                    </Field>
                    <Subscribe selector={(state) => [state.values.amcFrom]} children={([amcFrom]) => (
                        <Field name="amcTo">
                            {(field) => (
                                <div className="flex flex-col space-y-2">
                                    <Label>AMC To</Label>
                                    <Input type="date" {...(amcFrom !== null ? ({ min: amcFrom.toISOString().split("T")[0] }) : {})} value={field.state.value?.toISOString().split("T")[0]} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                                </div>
                            )}
                        </Field>
                    )} />
                </div>
                <span className="text-2xl text-zinc-600">Documents</span>
                <div className="grid grid-cols-3 gap-4"><Field name="softcopyOfPO">
                    {(field) => (
                        <div className="flex flex-col space-y-2">
                            <Label>Soft Copy of PO</Label>
                            <Input type="file" onChange={(e) => field.handleChange(e.target.files?.[0] || null)} />
                        </div>
                    )}
                </Field>
                    <Field name="softcopyOfInvoice">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Soft Copy of Invoice</Label>
                                <Input type="file" onChange={(e) => field.handleChange(e.target.files?.[0] || null)} />
                            </div>
                        )}
                    </Field>
                    <Field name="softcopyOfNFA">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Soft Copy of NFA</Label>
                                <Input type="file" onChange={(e) => field.handleChange(e.target.files?.[0] || null)} />
                            </div>
                        )}
                    </Field>
                    <Field name="softcopyOfAMC">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Soft Copy of AMC</Label>
                                <Input type="file" onChange={(e) => field.handleChange(e.target.files?.[0] || null)} />
                            </div>
                        )}
                    </Field>
                    <Field name="equipmentPhoto">
                        {(field) => (
                            <div className="flex flex-col space-y-2">
                                <Label>Equipment Photo</Label>
                                <Input type="file" onChange={(e) => field.handleChange(e.target.files?.[0] || null)} />
                            </div>
                        )}
                    </Field></div>
                <Field name="remarks">
                    {(field) => (
                        <div className="flex flex-col space-y-2">
                            <Label>Remarks</Label>
                            <Textarea value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                        </div>
                    )}
                </Field>

                {/* Submit Button */}
                <div className="col-span-3 flex justify-end">
                    <Subscribe selector={(state) => [state.canSubmit]}>
                        {([canSubmit]) => <Button disabled={!canSubmit} form="inventory-form">Add Item</Button>}
                    </Subscribe>
                </div>
            </form>
        </div>
    );
};

export default AddInventoryItem;
