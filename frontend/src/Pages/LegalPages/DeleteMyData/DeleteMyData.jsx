import { FaUserSlash } from "react-icons/fa";
import LegalPageLayout from "../LegalPageLayout";

function DeleteMyData() {
  return (
    <LegalPageLayout title="Data Deletion Request" icon={FaUserSlash}>
      <p>
        We respect your right to privacy and give you full control over your
        personal data. If you would like to delete your data from our ToDo app,
        please follow the instructions below.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. What Can Be Deleted?
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Your account information (name, email)</li>
          <li>Your saved tasks and activity logs</li>
          <li>All usage and tracking data associated with your account</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. How to Request Deletion
        </h2>
        <p>
          Please send a deletion request to{" "}
          <a
            href="mailto:dev.techdeveloper@gmail.com"
            className="text-secondary underline"
          >
            dev.techdeveloper@gmail.com
          </a>{" "}
          with the subject line <strong>“Data Deletion Request”</strong> and
          include:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Your registered email address</li>
          <li>Your username (if applicable)</li>
          <li>Confirmation that you want all data deleted</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. What Happens Next?
        </h2>
        <p>
          Once we verify your identity, your data will be permanently deleted
          from our system within 7 working days. This process is irreversible.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Exceptions
        </h2>
        <p>
          We may retain data as required by law or to resolve disputes, enforce
          agreements, or protect our legal rights.
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default DeleteMyData;
