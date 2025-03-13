import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Laboratory, User } from "src/server/entities/entities";
import { useForm } from '@tanstack/react-form'
import { Label } from "../ui/label";
import { toast } from "sonner";
import { ChevronDown, ShieldAlert } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DialogDescription } from "@radix-ui/react-dialog";

const AddUserDialog = ({ onAddUser }: { onAddUser: (user: Partial<User> & { labIds: string[] } ) => void }) => {
	const [labs, setLabs] = useState<Laboratory[]>([]);
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		fetch("/api/labs")
			.then((response) => response.json())
			.then((data) => setLabs(data));
	}, []);

	const { Field, Subscribe, state, handleSubmit, reset } = useForm({
		defaultValues: {
			email: '',
			permissions: 0 as 0 | 1,
			labIds: [] as string[]
		},
		onSubmit: ({ value: data }) => {
			data.email += "@hyderabad.bits-pilani.ac.in"
			onAddUser(data)
			setIsOpen(false)
		}
	})

	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			setIsOpen(open)
			reset()
		}}>
			<DialogTrigger asChild>
				<Button>Add User</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogDescription hidden>Dialog to add user</DialogDescription>
				<DialogHeader>
					<DialogTitle>Add User</DialogTitle>
				</DialogHeader>
				<form className="space-y-4" id="user-add-form" onSubmit={(e) => {
					e.preventDefault()
					// Fallback if button is not disabled for some malicious reason
					if (!state.canSubmit) toast.error("Incorrect email")

					handleSubmit()
				}}>
					<Field
						name="email">
						{(field) => (
							<>
								<Label htmlFor="email">Email</Label>
								<div className="grid grid-cols-2">
									<Input
										id="email"
										name="email"
										placeholder="username"
										className="rounded-r-none"
										required
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
									<div className="flex text-sm justify-center items-center bg-zinc-300 rounded-r-md w-full h-full">
										<span>@hyderabad.bits-pilani.ac.in</span>
									</div>
								</div>
							</>
						)}
					</Field>
					<Field name="permissions" children={({ state, handleChange }) => (<>
						<Label htmlFor="permissions">Role</Label>
						<div className="flex space-x-2">
							<Select required value={state.value.toString()} onValueChange={(value) => handleChange(parseInt(value) as 0 | 1)}>
								<SelectTrigger className="w-36">
									<SelectValue placeholder="Select Permissions" />
								</SelectTrigger>
								<SelectContent id="permissions">
									<SelectItem value="0">Technician</SelectItem>
									<SelectItem value="1">Admin</SelectItem>
								</SelectContent>
							</Select>{
								state.value ? <div className="flex justify-center items-center space-x-2 text-sm text-destructive"><ShieldAlert /><span>You are giving admin priveleges to this user.</span></div> : <></>
							}</div></>
					)} />
					<Subscribe selector={(state) => [state.values.permissions]} children={([permissions]) => (
						!permissions?<Field name="labIds" children={({ state, setValue }) => (<>
							<Label htmlFor="permissions">Laboratories</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="ml-auto">
										Select Labs <ChevronDown />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent id="laboratories-dropdown" align="end">
									<div className="max-w-28overflow-y-auto">
										{labs
											.map((lab) => {
												return (
													<DropdownMenuCheckboxItem
														key={lab.id}
														className="capitalize"
														//To stop the dropdown from closing on click
														onSelect={(e) => e.preventDefault()}
														checked={state.value.includes(lab.id)}
														onCheckedChange={(checked) => checked ? setValue((prev) => [...prev, lab.id]) : setValue((prev) => prev.filter((labId) => labId !== lab.id))}
													>
														{lab.name}
													</DropdownMenuCheckboxItem>
												)
											})}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
						)} />:<></>
					)} />
				</form>
				<DialogFooter>
					<Subscribe
						selector={(state) => [state.canSubmit]}
						children={([canSubmit]) => <Button disabled={!canSubmit} form="user-add-form">Add User</Button>}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddUserDialog;
