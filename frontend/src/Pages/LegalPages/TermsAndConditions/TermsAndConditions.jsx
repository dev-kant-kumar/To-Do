import { FaFileContract } from "react-icons/fa";
import LegalPageLayout from "../LegalPageLayout";

function TermsAndConditions() {
  return (
    <LegalPageLayout title="Terms & Conditions" icon={FaFileContract}>
      <p>
        These Terms & Conditions govern your use of our ToDo app. By accessing
        or using the app, you agree to be bound by these terms. Please read them
        carefully.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. Use of the App
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>The app is intended for personal and non-commercial use only</li>
          <li>You must be 13 years or older to use this app</li>
          <li>You agree to provide accurate information during registration</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. Account Security
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account login details. You agree to notify us immediately of any
          unauthorized access or use.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. Prohibited Activities
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Disrupting or interfering with the app's operation</li>
          <li>Using the app for illegal or harmful purposes</li>
          <li>Reverse engineering or attempting to access source code</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Intellectual Property
        </h2>
        <p>
          All content, branding, and code in this app belong to the developer.
          You may not reuse or redistribute any part of the application without
          permission.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          5. Termination
        </h2>
        <p>
          We reserve the right to suspend or terminate access to the app at our
          discretion, without notice, if you violate these terms.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          6. Modifications
        </h2>
        <p>
          These terms may be updated from time to time. Continued use of the app
          constitutes acceptance of any changes made.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">7. Contact</h2>
        <p>
          For questions about these terms, please contact us at{" "}
          <a
            href="mailto:dev.techdeveloper@gmail.com"
            className="text-secondary underline"
          >
            dev.techdeveloper@gmail.com
          </a>
          .
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default TermsAndConditions;
