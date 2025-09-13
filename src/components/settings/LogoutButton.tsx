"use client"
import { useRouter } from "next/navigation";
import { ClientUserService } from "@/lib/services/clientUserService";

interface LogoutButtonProps {
    confirmMessage?: string;
    errorMessage?: string;
    buttonText?: string;
}

const LogoutButton = ({ 
    confirmMessage = "Are you sure you want to logout?",
    errorMessage = "Logout failed. Please try again.",
    buttonText = "Logout"
}: LogoutButtonProps) => {
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm(confirmMessage)) {
            try {
                await ClientUserService.logout();
                router.push('/');
                router.refresh();
            } catch (error) {
                console.error('Logout failed:', error);
                alert(errorMessage);
            }
        }
    };

    return (
        <button 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleLogout}
        >
            {buttonText}
        </button>
    );
};

export default LogoutButton; 