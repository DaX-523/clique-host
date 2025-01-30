import type React from "react";

const ServiceInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8  w-full mb-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        CLIQUE HOST
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Deploy your frontend projects directly from GitHub with ease in a single
        click. Our service automatically builds and deploys your frontend
        applications, giving you a live URL in minutes.
      </p>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        How It Works
      </h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
        <li>Enter your GitHub repository URL in the input field below.</li>
        <li>Click the "Deploy" button to start the deployment process.</li>
        <li>
          Wait for the build and deployment to complete (usually takes 1-2
          minutes).
        </li>
        <li>Get a unique URL for your deployed frontend application.</li>
      </ol>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Important Notes
      </h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>
          Only frontend repositories are supported (e.g., React, Vue, Angular,
          static sites).
        </li>
        <li>
          Make sure your repository has a package.json file with a build script.
        </li>
        <li>
          The repository must be public or you must have the necessary
          permissions.
        </li>
        <li>Deployment may take up to 2 minutes. Please be patient.</li>
      </ul>
    </div>
  );
};

export default ServiceInfo;