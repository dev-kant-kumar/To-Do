import { FaExclamationTriangle } from "react-icons/fa";
import LegalPageLayout from "../LegalPageLayout";

function Disclaimer() {
  return (
    <LegalPageLayout title="Disclaimer" icon={FaExclamationTriangle}>
      <p>
        The information provided by our ToDo app is for general informational
        and productivity purposes only. While we aim to offer reliable and
        helpful services, we make no guarantees about the outcomes resulting
        from app usage.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. No Guarantees
        </h2>
        <p>
          We do not guarantee that your tasks will be completed, reminders will
          be sent on time, or that the service will be uninterrupted or
          error-free.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. Use At Your Own Risk
        </h2>
        <p>
          Any reliance you place on the app's features is strictly at your own
          risk. We are not responsible for any losses, missed deadlines, or
          damages.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. External Links
        </h2>
        <p>
          The app may contain links to third-party websites or services. We do
          not control these and are not responsible for their content or
          practices.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Changes and Updates
        </h2>
        <p>
          We may update this disclaimer without notice. Continued use of the app
          constitutes acceptance of any changes.
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default Disclaimer;
