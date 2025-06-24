import { FaCookieBite } from "react-icons/fa";
import LegalPageLayout from "../LegalPageLayout";

function CookiePolicy() {
  return (
    <LegalPageLayout title="Cookie Policy" icon={FaCookieBite}>
      <p>
        This Cookie Policy explains how our ToDo app uses cookies and similar
        technologies to enhance your experience.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. What Are Cookies?
        </h2>
        <p>
          Cookies are small text files stored on your device by websites you
          visit. They help recognize your browser and store information such as
          login status or preferences.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. How We Use Cookies
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To remember your login session (authentication)</li>
          <li>To measure usage via analytics tools</li>
          <li>To enhance UI/UX preferences</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. Types of Cookies We Use
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Essential Cookies:</strong> Required for basic functionality
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand usage (e.g.,
            Google Analytics)
          </li>
          <li>
            <strong>Preference Cookies:</strong> Save your theme and layout
            preferences
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Managing Cookies
        </h2>
        <p>
          You can control and manage cookies through your browser settings. You
          may also choose to disable cookies, but certain features may not work
          properly.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          5. Third-Party Cookies
        </h2>
        <p>
          Some cookies may be set by third-party services (e.g., Google
          Analytics, Firebase) for tracking and analytics. We do not control
          these cookies directly.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          6. Updates to This Policy
        </h2>
        <p>
          We may update this Cookie Policy from time to time. Continued use of
          the site means you accept the latest version.
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default CookiePolicy;
