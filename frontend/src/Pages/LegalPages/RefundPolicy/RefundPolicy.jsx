import { FaMoneyBillWave } from "react-icons/fa";
import LegalPageLayout from "../LegalPageLayout";

function RefundPolicy() {
  return (
    <LegalPageLayout title="Refund Policy" icon={FaMoneyBillWave}>
      <p>
        Our ToDo app currently offers both free and premium plans. This Refund
        Policy explains the terms under which you may be eligible for a refund
        of any paid subscription.
      </p>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          1. Free Plan
        </h2>
        <p>
          The free version of our app includes all basic task management
          features. No payment is required, and therefore no refund policy
          applies to free usage.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          2. Paid Subscriptions
        </h2>
        <p>
          Users who upgrade to a premium subscription may request a refund only
          if:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>The refund request is made within 7 days of purchase</li>
          <li>The user has not excessively used the premium features</li>
          <li>
            No violations of our{" "}
            <a href="/terms" className="underline text-secondary">
              Terms & Conditions
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          3. How to Request a Refund
        </h2>
        <p>
          Please send your refund request to{" "}
          <a
            href="mailto:dev.techdeveloper@gmail.com"
            className="text-secondary underline"
          >
            dev.techdeveloper@gmail.com
          </a>{" "}
          with your payment receipt and reason for the refund.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          4. Refund Processing
        </h2>
        <p>
          Eligible refunds will be processed within 5–10 business days to the
          original method of payment. Processing times may vary depending on
          your payment provider.
        </p>
      </div>

      <div>
        <h2 className="text-lg text-primary font-semibold mb-2">
          5. Non-Refundable Situations
        </h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Refund requests after 7 days of purchase</li>
          <li>Violations of our Terms & Conditions</li>
          <li>Misuse of the platform or abusive behavior</li>
        </ul>
      </div>

      <p className="text-sm text-gray-500 mt-8">Last updated: June 25, 2025</p>
    </LegalPageLayout>
  );
}

export default RefundPolicy;
