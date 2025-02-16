import Loading from "@/components/Loading";

const LoadingPage = () => {
    return <div className="flex min-h-screen items-center justify-center">
    <Loading title="Loading dashboard" description="Fetching information about your groups..." />
  </div>
}

export default LoadingPage