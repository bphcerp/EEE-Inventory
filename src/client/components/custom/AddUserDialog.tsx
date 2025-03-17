import { useState, useEffect, Dispatch, SetStateAction } from "react";
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
import api from "@/axiosInterceptor";
import { useSearchParams } from "react-router";

interface AddUserDialogProps {
	onAddUser: (user: Partial<User> & { labIds: string[] }) => void
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
}

const AddUserDialog = ({ onAddUser, isOpen, setIsOpen }: AddUserDialogProps) => {
	const [labs, setLabs] = useState<Laboratory[]>([]);
	const [searchParams, setSearchParams] = useSearchParams()

	useEffect(() => {
		api("/api/labs")
			.then(({ data }) => setLabs(data));
	}, []);

	const { Field, Subscribe, state, handleSubmit, reset } = useForm({
		defaultValues: {
			name: '',
			email: '',
			permissions: 0 as 0 | 1,
			role: '' as 'Admin' | 'Technician' | 'Faculty',
			labIds: [] as string[]
		},
		onSubmit: ({ value: data }) => {
			searchParams.delete('action')
			setSearchParams(searchParams)
			data.email += "@hyderabad.bits-pilani.ac.in"
			data.permissions = data.role === 'Admin' ? 1 : 0
			onAddUser(data)
			setIsOpen(false)
		}
	})

	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			setIsOpen(open)
			searchParams.delete('action')
			setSearchParams(searchParams)
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
						name="name">
						{(field) => (
							<>
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									className="rounded-r-none"
									required
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</>
						)}
					</Field>
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
					{/* <Field name="permissions" children={({ state, handleChange }) => (<>
						<Label htmlFor="permissions">Access</Label>
						<div className="flex space-x-2">
							<Select required value={state.value.toString()} onValueChange={(value) => handleChange(parseInt(value) as 0 | 1)}>
								<SelectTrigger className="w-36">
									<SelectValue placeholder="Select Permissions" />
								</SelectTrigger>
								<SelectContent id="permissions">
									<SelectItem value="0">Non-Admin</SelectItem>
									<SelectItem value="1">Admin</SelectItem>
								</SelectContent>
							</Select>{
								state.value ? <div className="flex justify-center items-center space-x-2 text-sm text-destructive"><ShieldAlert /><span>You are giving admin priveleges to this user.</span></div> : <></>
							}</div></>
					)} /> */}
					<Field name="role" children={({ state, handleChange }) => (<>
						<Label htmlFor="role">Role</Label>
						<div className="flex space-x-2">
							<Select required value={state.value} onValueChange={(value) => handleChange(value as 'Admin' | 'Technician' | 'Faculty')}>
								<SelectTrigger className="w-36">
									<SelectValue placeholder="Select Role" />
								</SelectTrigger>
								<SelectContent id="permissions">
									<SelectItem value="Technician">Technician</SelectItem>
									<SelectItem value="Faculty">Faculty</SelectItem>
									<SelectItem value="Admin">Admin</SelectItem>
								</SelectContent>
							</Select>{
								state.value === "Admin" ? <div className="flex justify-center items-center space-x-2 text-sm text-destructive"><ShieldAlert /><span>You are giving admin priveleges to this user.</span></div> : <></>
							}</div></>
					)} />
					<Subscribe selector={(state) => [state.values.permissions]} children={([permissions]) => (
						!permissions ? <Field name="labIds" children={({ state, setValue }) => (<>
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
						)} /> : <></>
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
