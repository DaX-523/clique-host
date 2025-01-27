import type React from "react"
import { useState } from "react"
import axios from "axios"

const GitHubDeployer: React.FC = () => {
  const [githubUrl, setGithubUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deploymentId, setDeploymentId] = useState<string | null>(null)
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null)
  const [pollingCount, setPollingCount] = useState(0)

  const handleDeploy = async () => {
    setIsLoading(true)
    setError(null)
    setDeploymentId(null)
    setDeploymentStatus(null)
    setPollingCount(0)

    try {
      const response = await axios.post("/api/deploy", { githubUrl })
      setDeploymentId(response.data.id)
      pollDeploymentStatus(response.data.id)
    } catch (err) {
      setError("Failed to start deployment. Please check the GitHub URL and try again.")
      setIsLoading(false)
    }
  }

  const pollDeploymentStatus = async (id: string) => {
    try {
      const response = await axios.get(`/api/status/${id}`)
      setDeploymentStatus(response.data.status)

      if (response.data.status === "deployed") {
        setIsLoading(false)
      } else if (pollingCount < 24) {
        // 2 minutes (5 seconds * 24)
        setPollingCount((prevCount) => prevCount + 1)
        setTimeout(() => pollDeploymentStatus(id), 5000)
      } else {
        setError("Deployment is taking longer than expected. Please check the status later.")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Failed to fetch deployment status.")
      setIsLoading(false)
    }
  }

  const isValidGithubUrl = (url: string) => {
    const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+$/
    return githubUrlRegex.test(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Deploy Your Frontend</h2>
      <div className="mb-6">
        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Repository URL
        </label>
        <input
          type="text"
          id="githubUrl"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-2 text-sm text-gray-500">
          Make sure your repository contains a frontend project (e.g., React, Vue, Angular).
        </p>
      </div>
      <button
        onClick={handleDeploy}
        disabled={!isValidGithubUrl(githubUrl) || isLoading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium transition duration-150 ease-in-out ${
          isValidGithubUrl(githubUrl) && !isLoading
            ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Deploying...
          </span>
        ) : (
          "Deploy"
        )}
      </button>
      {error && (
        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      {deploymentStatus === "deployed" && (
        <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md">
          <h3 className="font-bold mb-2">Deployment Successful!</h3>
          <p>
            Your site is now available at:{" "}
            <a
              href={`http://${deploymentId}.domain.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              http://{deploymentId}.domain.com
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

export default GitHubDeployer

