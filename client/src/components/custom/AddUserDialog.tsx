import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from '@tanstack/react-form'
import { Label } from "../ui/label";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { NewUserRequest, User } from "@/types/types";

interface AddUserDialogProps {
	onAddUser: (user: NewUserRequest) => void
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
	editInitialData?: User
}

const AddUserDialog = ({ onAddUser, isOpen, setIsOpen, editInitialData }: AddUserDialogProps) => {

	const { Field, Subscribe, state, handleSubmit, reset } = useForm({
		defaultValues: {
			name: editInitialData?.name ?? '',
			email: editInitialData?.email.split("@")[0] ?? '',
			permissions: editInitialData?.permissions ?? 0,
			role: editInitialData?.role ?? '',
		} as NewUserRequest,
		onSubmit: ({ value: data }) => {
			if (!data.role){
				toast.error('Role not assigned to user')
				return
			}
			data.email += "@hyderabad.bits-pilani.ac.in"
			data.permissions = data.role === 'Admin' ? 1 : 0
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
				{editInitialData ? (
					<Button variant="outline" className="text-blue-500 hover:text-blue-700 hover:bg-background">
						Edit User
					</Button>
				) : (
					<Button>Add User</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogDescription hidden>Dialog to add user</DialogDescription>
				<DialogHeader>
					<DialogTitle>{editInitialData ? "Edit User" : "Add User"}</DialogTitle>
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
				</form>
				<DialogFooter>
					<Subscribe
						selector={(state) => [state.canSubmit]}
						children={([canSubmit]) => <Button disabled={!canSubmit} form="user-add-form">
							{editInitialData ? "Edit User" : "Add User"}
						</Button>}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddUserDialog;
