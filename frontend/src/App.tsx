import type React from "react"
import ServiceInfo from "./components/ServiceInfo"
import GitHubDeployer from "./components/GitHubDeployer"

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ServiceInfo />
        <GitHubDeployer />
      </div>
    </div>
  )
}

export default App

