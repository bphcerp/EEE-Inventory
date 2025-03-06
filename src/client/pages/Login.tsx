import { LoginForm } from "@/components/login-form"
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <GoogleOAuthProvider clientId={import.meta.env.VITE_PUBLIC_OAUTH_CID}><LoginForm /></GoogleOAuthProvider>
      </div>
    </div>
  )
}
