// src/pages/Legal Pages/Accessibility/Accessibility.jsx
import React from "react";
import { FaUniversalAccess } from "react-icons/fa";
import LegalPageLayout from "../LegalPageLayout";

function Accessibility() {
  return (
    <LegalPageLayout title="Accessibility Statement" icon={FaUniversalAccess}>
      <p>
        We are committed to making our ToDo app accessible to everyone,
        including people with disabilities. Our goal is to provide a
        user-friendly, inclusive, and accessible experience for all users.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. Accessibility Features
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Keyboard navigation support</li>
          <li>Dark mode and high-contrast UI options</li>
          <li>Screen reader compatibility</li>
          <li>Clear and simple layouts for better readability</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. Standards We Follow
        </h2>
        <p>
          Our design aims to conform with Web Content Accessibility Guidelines
          (WCAG) 2.1 Level AA wherever possible. We regularly update and review
          the platform for compliance.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. Continuous Improvement
        </h2>
        <p>
          We are continuously improving the accessibility of our platform. If
          you encounter any issues, we encourage you to reach out.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Contact Us
        </h2>
        <p>
          If you experience any accessibility barriers, please contact us at{" "}
          <a
            href="mailto:dev.techdeveloper@gmail.com"
            className="text-secondary underline"
          >
            dev.techdeveloper@gmail.com
          </a>
          . We will do our best to resolve the issue quickly.
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default Accessibility;
