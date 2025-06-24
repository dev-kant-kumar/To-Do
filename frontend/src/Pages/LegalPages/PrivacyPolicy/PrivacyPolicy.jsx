import LegalPageLayout from "../LegalPageLayout";
import { FaUserShield } from "react-icons/fa";

function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" icon={FaUserShield}>
      <p>
        Your privacy is important to us. This Privacy Policy explains how we
        collect, use, and protect your personal information when you use our
        ToDo app.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Your email address and name when you sign up</li>
          <li>Usage data (like tasks created, login times)</li>
          <li>Cookies and analytics if enabled</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. How We Use Information
        </h2>
        <p>We use the collected data to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Provide, maintain, and improve the app</li>
          <li>Communicate with you (if needed)</li>
          <li>Monitor usage and performance</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. Data Protection
        </h2>
        <p>
          We implement standard security measures to protect your information.
          Your data is not sold or shared with third parties.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Data Retention
        </h2>
        <p>
          We retain your data as long as your account is active or as needed to
          provide services.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          5. Your Rights
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Request access or deletion of your data</li>
          <li>Withdraw consent anytime</li>
          <li>Request correction of incorrect data</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">6. Contact</h2>
        <p>
          For any questions or data concerns, email us at{" "}
          <a
            href="mailto:dev.techdeveloper@gmail.com"
            className="text-secondary underline"
          >
            dev.techdeveloper@gmail.com
          </a>
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default PrivacyPolicy;
