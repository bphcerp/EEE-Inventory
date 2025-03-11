import { LoginForm } from "@/components/login-form"
import { useUserPermissions } from "@/contexts/UserPermissionsProvider"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useEffect } from "react"
import { useNavigate } from "react-router"

export default function LoginPage() {

  const navigate = useNavigate()
  const userPermissions = useUserPermissions()
  
  if (userPermissions !== null) {
    navigate('/dashboard')
    return
  }

  return userPermissions === null && (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <GoogleOAuthProvider clientId={import.meta.env.VITE_PUBLIC_OAUTH_CID}><LoginForm /></GoogleOAuthProvider>
      </div>
    </div>
  )
}
